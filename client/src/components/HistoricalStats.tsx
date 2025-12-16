import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { historicalData } from "@/lib/historyData";
import { motion } from "framer-motion";
import { Calendar, ChevronDown, Trophy } from "lucide-react";
import { useState } from "react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const COLORS = [
  "var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)",
  "#ff00ff", "#00ffff", "#ffff00", "#ff0000", "#00ff00"
];

export function HistoricalStats() {
  const [selectedYear, setSelectedYear] = useState<string>("2024");
  const data = historicalData[parseInt(selectedYear)];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple neon-text">
          Historical Statistics
        </h2>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="Select Year" />
          </SelectTrigger>
          <SelectContent className="bg-black/90 border-white/10 text-white backdrop-blur-xl">
            {Object.keys(historicalData).sort((a, b) => parseInt(b) - parseInt(a)).map((year) => (
              <SelectItem key={year} value={year} className="focus:bg-white/10 cursor-pointer">
                Year {parseInt(year) + 543} ({year})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card border-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/60">Total Draws</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-neon-cyan">{data.totalDraws}</div>
            <p className="text-xs text-white/40 mt-1">In year {parseInt(selectedYear) + 543}</p>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-none md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/60">Most Frequent Numbers (2 Digits)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {data.mostFrequent.map((item, index) => (
                <div key={index} className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-lg min-w-[120px]">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center font-bold text-black text-sm
                    ${index === 0 ? 'bg-neon-cyan shadow-[0_0_10px_var(--color-neon-cyan)]' : 'bg-white/50'}
                  `}>
                    {item.number}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-white/40">Count</span>
                    <span className="font-bold text-neon-purple">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Digit Frequency Chart */}
      <Card className="glass-card border-none">
        <CardHeader>
          <CardTitle className="text-neon-green">Digit Frequency Analysis ({parseInt(selectedYear) + 543})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.digitFrequency}>
                <XAxis dataKey="digit" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {data.digitFrequency.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* History Table */}
      <Card className="glass-card border-none">
        <CardHeader>
          <CardTitle className="text-neon-cyan flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Draw History ({parseInt(selectedYear) + 543})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left text-white/80">
              <thead className="text-xs text-white/40 uppercase bg-white/5">
                <tr>
                  <th scope="col" className="px-6 py-3 rounded-l-lg">Date</th>
                  <th scope="col" className="px-6 py-3 text-neon-cyan">1st Prize</th>
                  <th scope="col" className="px-6 py-3 text-neon-purple">Last 2</th>
                  <th scope="col" className="px-6 py-3">Front 3</th>
                  <th scope="col" className="px-6 py-3 rounded-r-lg">Back 3</th>
                </tr>
              </thead>
              <tbody>
                {data.draws.map((draw, index) => (
                  <motion.tr 
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium">{draw.date}</td>
                    <td className="px-6 py-4 font-mono text-neon-cyan font-bold">{draw.firstPrize}</td>
                    <td className="px-6 py-4 font-mono text-neon-purple font-bold text-lg">{draw.lastTwo}</td>
                    <td className="px-6 py-4 font-mono">{draw.frontThree.join(", ")}</td>
                    <td className="px-6 py-4 font-mono">{draw.backThree.join(", ")}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
