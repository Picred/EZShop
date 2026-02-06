from fastapi import APIRouter, Depends
from app.config.config import ROUTES
from app.controllers.dashboard_controller import DashboardController
from app.models.DTO.dashboard_dto import DashboardDTO
from app.middleware.auth_middleware import authenticate_user
from app.models.user_type import UserType

router = APIRouter(prefix=ROUTES["V1_GENERAL"] + "/dashboard", tags=["Dashboard"])
controller = DashboardController()

@router.get(
    "/stats",
    response_model=DashboardDTO,
    dependencies=[
        Depends(authenticate_user([UserType.Administrator, UserType.ShopManager, UserType.Cashier]))
    ],
)
async def get_dashboard_stats():
    """
    Get aggregated dashboard statistics.
    """
    return await controller.get_stats()
