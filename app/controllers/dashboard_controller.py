from app.repositories.dashboard_repository import DashboardRepository
from app.models.DTO.dashboard_dto import DashboardDTO

class DashboardController:
    def __init__(self):
        self.repository = DashboardRepository()

    async def get_stats(self) -> DashboardDTO:
        return await self.repository.get_dashboard_stats()
