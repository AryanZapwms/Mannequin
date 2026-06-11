import { dbConnect } from "@/lib/db/connect";
import { SiteSetting } from "@/lib/db/models/SiteSetting";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { upsertSetting, deleteSetting } from "./actions";

async function removeSetting(formData: FormData) {
  "use server";
  const settingId = formData.get("settingId");
  if (typeof settingId !== "string") {
    throw new Error("Setting id is required");
  }
  await deleteSetting(settingId);
}

export default async function SettingsPage() {
  await dbConnect();
  const settingDocs = await SiteSetting.find().sort({ key: 1 });

  const settings = settingDocs.map((setting) => ({
    id: setting._id.toString(),
    key: setting.key,
    value: setting.value,
    description: setting.description ?? null,
    updated_at: setting.updatedAt ? setting.updatedAt.toISOString() : null,
  }));

  return (
    <section className="grid gap-8 lg:grid-cols-[2fr_1fr]">
      <Card className="order-2 lg:order-1">
        <CardHeader>
          <CardTitle>Current settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings.length === 0 ? (
            <p className="text-sm text-muted-foreground">No settings saved yet.</p>
          ) : (
            settings.map((setting) => (
              <div key={setting.id} className="rounded-xl border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold">{setting.key}</p>
                    <p className="text-xs text-muted-foreground">
                      Updated {setting.updated_at ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(setting.updated_at)) : ""}
                    </p>
                    <pre className="mt-3 whitespace-pre-wrap rounded-lg bg-muted/40 p-3 text-xs">{JSON.stringify(setting.value, null, 2)}</pre>
                    {setting.description ? (
                      <p className="mt-2 text-xs text-muted-foreground">{setting.description}</p>
                    ) : null}
                  </div>
                  <form action={removeSetting}>
                    <input type="hidden" name="settingId" value={setting.id} />
                    <Button variant="destructive" size="sm">
                      Delete
                    </Button>
                  </form>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
      <Card className="order-1 lg:order-2">
        <CardHeader>
          <CardTitle>Add or update setting</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={upsertSetting} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="key">Key</Label>
              <Input id="key" name="key" placeholder="PAYMENT_GATEWAY" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">Value (JSON)</Label>
              <textarea
                id="value"
                name="value"
                rows={6}
                defaultValue="{}"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <Button type="submit" className="w-full">
              Save setting
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
