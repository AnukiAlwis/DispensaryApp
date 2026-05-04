import React from "react";
import "./TopSummaryBar.css";
import { ReactComponent as WaitingSVG } from "../assets/images/waitingPatients.svg";
import { ReactComponent as ServedSVG } from "../assets/images/servedPatients.svg";
import { ReactComponent as IncomeSVG } from "../assets/images/income.svg";
import { ReactComponent as CharitySVG } from "../assets/images/charity.svg";

const IconWaiting = () => (
  <div className="icon-placeholder gold">
    <WaitingSVG />
  </div>
);
const IconServed = () => (
  <div className="icon-placeholder teal">
    <ServedSVG />
  </div>
);
const IconIncome = () => (
  <div className="icon-placeholder green">
    <IncomeSVG />
  </div>
);
const IconCharity = () => (
  <div className="icon-placeholder purple">
    <CharitySVG />
  </div>
);

const TopSummaryBar = () => {
  const stats = [
    {
      label: "Patients Waiting",
      value: 1,
      icon: IconWaiting,
      className: "gold",
    },
    {
      label: "Patients Served",
      value: 2,
      icon: IconServed,
      className: "teal",
    },
    {
      label: "Total Income",
      value: 6000,
      icon: IconIncome,
      className: "green",
    },
    {
      label: "Total Charity",
      value: 200,
      icon: IconCharity,
      className: "purple",
    },
  ];

  return (
    <div className="summary-card-container">
      <div className="summary-header">Today's Summary</div>
      <div className="summary-content">
        {stats.map((item) => {
          const IconComponent = item.icon;

          return (
            <div className="summary-item" key={item.label}>
              <div className={`icon-container ${item.className}`}>
                <IconComponent />
              </div>
              <div className="value-label-container">
                <span className="value">{item.value}</span>
                <span className="label">{item.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TopSummaryBar;
