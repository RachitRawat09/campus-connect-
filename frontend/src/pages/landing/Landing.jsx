import React from "react";
import Hero from "./Hero";
import Categories from "./Categories";
import Benefits from "./Benefits";
import HowItWorks from "./HowItWorks";
import Safety from "./Safety";
import FAQ from "./FAQ";
import CTA from "./CTA";

const Landing = () => {
  return (
    <div>
      <Hero />
      <Categories />
      <Benefits />
      <HowItWorks />
      <Safety/>
      <FAQ />
      <CTA />
    </div>
  );
};

export default Landing;
