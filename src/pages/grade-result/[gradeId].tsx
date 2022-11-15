import React, { useState } from "react";
import { NextPage } from "next";
import Head from "next/head";

import { useQuery } from "@tanstack/react-query";
import { FaHeart, FaLink } from "react-icons/fa";
import { FiShare } from "react-icons/fi";
import { numberWithCommas } from "../../utils/formatters";
import { fetchSchoolById } from "../../utils/queries";
import Header from "../../components/header";
import Button from "../../components/button";

type SchoolInfoProps = {
  name: string;
  city: string;
  state: string;
  cost_attendance: number;
  net_price: number;
  median_10_salary: number;
  average_loan: number;
};

const SchoolInfo = ({
  name,
  city,
  state,
  cost_attendance,
  net_price,
  median_10_salary,
  average_loan,
}: SchoolInfoProps) => {
  return (
    <section className="mb-8 md:mb-0">
      <div className="mb-2 md:mb-8">
        <h2 className="mb-1 text-4xl font-bold md:text-5xl">{name}</h2>
        <p>
          {city}, {state}
        </p>
      </div>
      <ul>
        <li className="flex justify-between md:text-lg">
          <p className="font-bold">Cost of attendance per year</p>
          <p>${numberWithCommas(cost_attendance)}</p>
        </li>
        <li className="flex justify-between md:text-lg">
          <p className="font-bold">Net price per year</p>
          <p>${numberWithCommas(net_price)}</p>
        </li>
        <li className="flex justify-between md:text-lg">
          <p className="font-bold">Average Loan Amount</p>
          <p>${numberWithCommas(average_loan)}</p>
        </li>
        <li className="flex justify-between md:text-lg">
          <p className="font-bold">Median 10 year salary</p>
          <p>${numberWithCommas(median_10_salary)}</p>
        </li>
      </ul>
    </section>
  );
};

const GradeResultPage: NextPage = () => {
  /**
   * Tasks
   * - Save grade to Supabase database
   * - Pull in grade from data, Zustand?
   * - Show info on the school
   * - Show share button
   * - Show save button
   */
  const [copying, setCopying] = useState(false);
  const [scoreResult, setScoreResult] = useState({
    gradeNumber: 10,
    schoolId: 100654,
    userId: 3,
    financialAidAmount: 12000,
    inOutState: "IN-STATE",
  });

  const [schoolId, setSchoolId] = useState(100654);

  const schoolQuery = useQuery({
    queryKey: ["school", schoolId],
    queryFn: () => fetchSchoolById(schoolId),
  });

  /**  Function for share button that either copies the link to clipboard or activates the mobile share if available */
  const shareLink = () => {
    console.log("clicked!");
    if (navigator.share) {
      navigator
        .share({
          title: `GradeMyAid Rating`,
          url: typeof window !== "undefined" ? window.location.href : "",
        })
        .then(() => {
          console.log(`Thanks for sharing!`);
        })
        .catch(console.error);
    } else {
      const cb = navigator.clipboard;
      if (copying) {
        setCopying(false);
      }
      cb.writeText(typeof window !== "undefined" ? window.location.href : "")
        .then(() => {
          setCopying(true);
        })
        .catch(console.error);
    }
  };

  console.log(schoolQuery.data);

  const schoolData = schoolQuery.isFetched && schoolQuery.data?.data.results[0];

  return (
    <div>
      <Head>
        <title>GradeMyAid</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <main className="flex min-h-screen flex-col items-center justify-center space-y-16 bg-emerald-200 px-8">
        <div className="flex flex-col-reverse items-center justify-center md:flex-row md:space-x-8">
          <section className="rounded-2xl bg-emerald-50 p-8 shadow-lg shadow-emerald-300">
            <div>
              <p className="font-bold">Your grade:</p>
            </div>
            <div>
              <p className="text-[15rem] font-bold">
                {scoreResult.gradeNumber}
              </p>
            </div>
          </section>
          {!schoolQuery.isLoading ? (
            <SchoolInfo
              name={schoolData.school.name}
              cost_attendance={schoolData.latest.cost.attendance.academic_year}
              city={schoolData.school.city}
              state={schoolData.school.state}
              median_10_salary={
                schoolData.latest.earnings["10_yrs_after_entry"].median
              }
              net_price={schoolData.latest.cost.avg_net_price.overall}
              average_loan={schoolData.latest.aid.loan_principal}
            />
          ) : (
            <div>Loading...</div>
          )}
        </div>
        <div className="flex space-x-4">
          <Button color="rose" label="Save Grade" icon={<FaHeart />} />
          <div className="relative z-10">
            <Button
              onClick={shareLink}
              color="violet"
              label="Share Grade"
              icon={<FiShare />}
            />
            <div
              // Role alert and aria-live announce to screen readers
              role="alert"
              aria-live="polite"
              className={`share-popup pointer-events-none absolute top-0 left-1/2 z-10 w-56 max-w-3xl origin-center rounded-md bg-violet-300 px-4 py-2 text-center text-sm font-bold ${
                copying && "animate-popup"
              }`}
            >
              <p className={`${!copying && "hidden"} flex items-center`}>
                URL Copied to Clipboard <FaLink className="ml-2" />
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GradeResultPage;
