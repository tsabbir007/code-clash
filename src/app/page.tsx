import ContestWrapper from "@/components/contest/contest-wrapper";
import { Navbar } from "@/components/navbar/navbar";
import UserInfo from "@/components/user-info";

export default function Home() {
  return (
    <div className="container mx-auto">
      <Navbar />
      <ContestWrapper />
      {/* <UserInfo /> */}
    </div>
  );
}




