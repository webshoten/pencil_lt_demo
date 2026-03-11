import Header from "@/components/Header";
import MapContainer from "@/components/MapContainer";

export default function Home() {
  return (
    <div className="flex h-screen flex-col">
      <Header />
      <MapContainer />
    </div>
  );
}
