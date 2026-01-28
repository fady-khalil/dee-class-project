import React from "react";
import Hero from "./hero/Hero";
import Tabs from "./Tabs/Tabs";
import WhoWeAre from "./WhoWeAre/WhoWeAre";
import Leaders from "./Leaders/Leaders";
import Certiciations from "./Certifications/Certiciations";

import useFetch from "Hooks/useFetch";
import { useEffect } from "react";
import IsLoading from "Components/RequestHandler/IsLoading";
const About = () => {
  const { data, isLoading, isError, fetchData } = useFetch("");

  useEffect(() => {
    fetchData("about");
  }, []);

  if (isLoading) {
    return <IsLoading />;
  }

  if (data) {
    return (
      <main>
        <Hero data={data?.hero} />
        <Tabs />
        <div id="who-we-are-section">
          <WhoWeAre featured={data?.features} data={data?.who_we_are} />
        </div>
        <div id="leaders-section">
          <Leaders data={data?.leaders} />
        </div>
        {/* <div id="certifications-section">
          <Certiciations />
        </div> */}
      </main>
    );
  }
};

export default About;
