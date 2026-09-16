import { DirectionProvider } from "@base-ui/react/direction-provider";
import { Outlet, useLocation } from "@tanstack/react-router";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { ThemeProvider } from "@/components/theme-provider";
import { getLocaleFromPath } from "@/lib/seo";

export function RootLayout() {
  const { pathname } = useLocation();
  const locale = getLocaleFromPath(pathname);

  return (
    <DirectionProvider direction={locale === "ar" ? "rtl" : "ltr"}>
      <ThemeProvider>
        <div className="flex min-h-screen flex-col bg-paper text-ink antialiased selection:bg-signal/20 selection:text-signal-ink transition-colors duration-200">
          <SiteNav currentPath={pathname} locale={locale} />
          <main className="flex-1">
            <Outlet />
          </main>
          <SiteFooter locale={locale} />
        </div>
      </ThemeProvider>
    </DirectionProvider>
  );
}
