// A React app that parses a crontab file and shows time slots on a diagram
import React, { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function parseCrontab(content) {
  const lines = content.split("\n").filter(line => line && !line.startsWith("#"));
  const jobs = lines.map(line => {
    const [min, hour, day, month, week, ...command] = line.trim().split(/\s+/);
    return {
      min, hour, day, month, week,
      command: command.join(" ")
    };
  });
  return jobs;
}

function generateSchedule(jobs) {
  // We’ll simulate 24 hours, with each hour broken into 60 minutes
  const timeline = Array(24 * 60).fill("free");

  jobs.forEach(job => {
    let minutes = job.min === "*" ? [...Array(60).keys()] : [parseInt(job.min, 10)];
    let hours = job.hour === "*" ? [...Array(24).keys()] : [parseInt(job.hour, 10)];

    minutes.forEach(m => {
      hours.forEach(h => {
        const index = h * 60 + m;
        if (!isNaN(index)) timeline[index] = "occupied";
      });
    });
  });

  const data = timeline.map((status, i) => ({
    time: `${String(Math.floor(i / 60)).padStart(2, "0")}:${String(i % 60).padStart(2, "0")}`,
    status: status === "occupied" ? 1 : 0
  }));

  return data;
}

export default function CrontabVisualizer() {
  const [chartData, setChartData] = useState(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const text = await file.text();
      const jobs = parseCrontab(text);
      const data = generateSchedule(jobs);
      setChartData(data);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Crontab Visualizer</h1>
      <input type="file" accept=".txt,.cron" onChange={handleFileUpload} />
      {chartData && (
        <Card>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={chartData}>
                <XAxis dataKey="time" interval={60} />
                <YAxis allowDecimals={false} domain={[0, 1]} tickFormatter={val => val === 1 ? "Occupied" : "Free"} />
                <Tooltip labelFormatter={label => `Time: ${label}`} formatter={(value) => value === 1 ? "Occupied" : "Free"} />
                <Area type="monotone" dataKey="status" stroke="#8884d8" fill="#8884d8" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
