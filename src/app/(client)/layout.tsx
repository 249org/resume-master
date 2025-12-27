import ThemeSwitch from "@/components/theme-switch";
import Providers from "../providers";

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <main>
      <Providers>
        <ThemeSwitch />
        {children}
      </Providers>
    </main>
  );
}
