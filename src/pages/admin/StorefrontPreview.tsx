import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StorefrontPreview() {
  const previewUrl = window.location.origin + "/";

  return (
    <div className="space-y-4 h-[calc(100vh-5rem)]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Storefront Preview</h1>
          <p className="text-sm text-muted-foreground mt-1">Live view of your marketplace page</p>
        </div>
        <Button
          variant="outline"
          className="gap-2 border-border/50"
          onClick={() => window.open("/", "_blank")}
        >
          <ExternalLink className="w-4 h-4" />
          Open in new tab
        </Button>
      </div>

      <div
        className="rounded-2xl border border-border/50 overflow-hidden bg-card/50 backdrop-blur-sm flex-1"
        style={{ height: "calc(100% - 4rem)", boxShadow: "0 0 30px hsl(255 100% 62% / 0.05)" }}
      >
        <iframe
          src="/"
          className="w-full h-full border-0"
          title="Storefront Preview"
        />
      </div>
    </div>
  );
}
