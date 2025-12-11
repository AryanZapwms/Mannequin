import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateReviewStatus } from "./actions";
import { Star } from "lucide-react";

export default async function ReviewsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("product_reviews")
    .select(
      `id, rating, title, body, status, created_at, user_id, admin_response,
      product:products(id, name)`
    )
    .order("created_at", { ascending: false });

  const reviews = data ?? [];

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Reviews</h1>
        <p className="text-sm text-muted-foreground">Moderate customer feedback and share official responses.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Pending moderation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reviews yet.</p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="rounded-xl border p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Star className="h-4 w-4 text-amber-500" />
                      <span>{review.rating}/5</span>
                      <span className="text-muted-foreground">{review.title ?? "Review"}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Product: {review.product?.name ?? "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">User ID: {review.user_id ?? "Guest"}</p>
                    <p className="text-sm leading-relaxed">{review.body}</p>
                    {review.admin_response ? (
                      <div className="rounded-lg border bg-muted/40 p-3 text-sm">
                        <p className="font-semibold">Admin response</p>
                        <p className="text-muted-foreground">{review.admin_response}</p>
                      </div>
                    ) : null}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {review.created_at
                      ? new Intl.DateTimeFormat("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(new Date(review.created_at))
                      : ""}
                  </p>
                </div>
                <form action={updateReviewStatus} className="mt-4 grid gap-4 md:grid-cols-[1fr_auto]">
                  <input type="hidden" name="reviewId" value={review.id} />
                  <div className="grid gap-2">
                    <Label htmlFor={`status-${review.id}`}>Status</Label>
                    <select
                      id={`status-${review.id}`}
                      name="status"
                      defaultValue={review.status ?? "pending"}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <Label htmlFor={`response-${review.id}`} className="pt-2">Admin response</Label>
                    <textarea
                      id={`response-${review.id}`}
                      name="response"
                      rows={3}
                      defaultValue={review.admin_response ?? ""}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button type="submit" className="w-full md:w-auto">
                      Save
                    </Button>
                  </div>
                </form>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </section>
  );
}
