
import Header from "./components/Header";
import Hero from "./components/Hero";

import Text from "./components/Text";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col">
      <Header />
      <Hero />
      <Text />
    
    </main>
  );
}
