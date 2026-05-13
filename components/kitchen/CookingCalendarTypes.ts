export interface CookingScheduleEvent {
  id: string;
  userId: string;
  savedRecipeId?: string | null;
  recipeName: string;
  scheduledDate: string;
  note?: string | null;
  createdAt: string;
}
