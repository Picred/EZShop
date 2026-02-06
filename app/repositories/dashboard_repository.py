from datetime import datetime, timedelta
from typing import List, Tuple
from sqlalchemy import func, case, desc, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.database import AsyncSessionLocal
from app.models.DAO.sale_dao import SaleDAO
from app.models.DAO.sold_product_dao import SoldProductDAO
from app.models.DAO.order_dao import OrderDAO
from app.models.DAO.product_dao import ProductDAO
from app.models.DTO.dashboard_dto import DashboardDTO, KPIDTO, ChartDataPointDTO, ProductStatDTO

class DashboardRepository:
    def __init__(self):
        pass

    async def get_dashboard_stats(self) -> DashboardDTO:
        async with AsyncSessionLocal() as db:
            now = datetime.now()
            this_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            last_month_end = this_month_start - timedelta(seconds=1)
            last_month_start = last_month_end.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

            # 1. Revenue & Sales
            # Fetch all PAID sales first (for total and monthly calc - crude but easy given current design)
            # Optimization: filter by date if dataset large, but for now fetch all to calc totals
            # Actually, `total_revenue` is ALL TIME.
            stmt = select(SaleDAO).where(SaleDAO.status == 'PAID')
            result = await db.execute(stmt)
            sales = result.scalars().all()
            
            total_revenue = 0.0
            total_sales_count = len(sales)
            
            this_month_revenue = 0.0
            this_month_sales_count = 0
            
            last_month_revenue = 0.0
            last_month_sales_count = 0

            for sale in sales:
                # Calculate sale total
                sale_total = 0
                for line in sale.lines:
                    line_price = line.price_per_unit * line.quantity * (1 - line.discount_rate)
                    sale_total += line_price
                sale_total = sale_total * (1 - sale.discount_rate)
                
                # Add to total
                total_revenue += sale_total
                
                # Check dates
                if sale.created_at:
                    # Naive datetime check (assuming local time or consistent UTC)
                    if sale.created_at >= this_month_start:
                        this_month_revenue += sale_total
                        this_month_sales_count += 1
                    elif sale.created_at >= last_month_start and sale.created_at < this_month_start:
                        last_month_revenue += sale_total
                        last_month_sales_count += 1

            # Calculate trends
            revenue_change = 0.0
            if last_month_revenue > 0:
                revenue_change = ((this_month_revenue - last_month_revenue) / last_month_revenue) * 100
            elif this_month_revenue > 0:
                 revenue_change = 100.0 # From 0 to something is 100% growth? Or infinite. 100 is safe.
            
            sales_change = 0.0
            if last_month_sales_count > 0:
                sales_change = ((this_month_sales_count - last_month_sales_count) / last_month_sales_count) * 100
            elif this_month_sales_count > 0:
                sales_change = 100.0

            # 2. Active Orders
            stmt = select(func.count(OrderDAO.id)).where(OrderDAO.status == 'ISSUED')
            result = await db.execute(stmt)
            active_orders_count = result.scalar() or 0

            # 3. Total Products
            stmt = select(func.count(ProductDAO.id))
            result = await db.execute(stmt)
            total_products_count = result.scalar() or 0

            # 4. Top Selling Products
            stmt = select(
                SoldProductDAO.product_barcode,
                ProductDAO.description,
                func.sum(SoldProductDAO.quantity).label('total_qty'),
                func.sum(SoldProductDAO.quantity * SoldProductDAO.price_per_unit * (1 - SoldProductDAO.discount_rate)).label('total_rev')
            ).join(ProductDAO, SoldProductDAO.id == ProductDAO.id)\
             .join(SaleDAO, SoldProductDAO.sale_id == SaleDAO.id)\
             .where(SaleDAO.status == 'PAID')\
             .group_by(SoldProductDAO.product_barcode, ProductDAO.description)\
             .order_by(desc('total_qty'))\
             .limit(5)
            
            result = await db.execute(stmt)
            top_products = []
            for row in result:
                top_products.append(ProductStatDTO(
                    barcode=row[0],
                    description=row[1],
                    quantity_sold=row[2],
                    revenue=float(row[3] or 0)
                ))

            # 5. Monthly Earnings Trend (Last 6 months)
            six_months_ago = datetime.now() - timedelta(days=180)
            stmt = select(SaleDAO).where(
                SaleDAO.created_at >= six_months_ago,
                SaleDAO.status == 'PAID'
            ).order_by(SaleDAO.created_at)
            
            result = await db.execute(stmt)
            recent_sales = result.scalars().all()
            
            monthly_data = {}
            for sale in recent_sales:
                month_key = sale.created_at.strftime("%b %Y")
                sale_total = 0
                for line in sale.lines:
                    sale_total += line.price_per_unit * line.quantity * (1 - line.discount_rate)
                sale_total = sale_total * (1 - sale.discount_rate)
                
                monthly_data[month_key] = monthly_data.get(month_key, 0) + sale_total
            
            earnings_trend = [
                ChartDataPointDTO(label=k, value=v) for k, v in monthly_data.items()
            ]

            return DashboardDTO(
                total_revenue=KPIDTO(value=total_revenue, change=round(revenue_change, 1)),
                total_sales=KPIDTO(value=total_sales_count, change=round(sales_change, 1)),
                active_orders=KPIDTO(value=active_orders_count, change=0),
                total_products=KPIDTO(value=total_products_count, change=0),
                earnings_trend=earnings_trend,
                top_products=top_products
            )
