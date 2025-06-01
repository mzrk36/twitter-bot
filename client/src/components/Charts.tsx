import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import Chart from "chart.js/auto";

export default function Charts() {
  const performanceChartRef = useRef<HTMLCanvasElement>(null);
  const engagementChartRef = useRef<HTMLCanvasElement>(null);
  const performanceChartInstance = useRef<Chart | null>(null);
  const engagementChartInstance = useRef<Chart | null>(null);

  const { data: analytics } = useQuery({
    queryKey: ["/api/analytics"],
    retry: false,
  });

  useEffect(() => {
    if (performanceChartRef.current && analytics) {
      // Destroy existing chart
      if (performanceChartInstance.current) {
        performanceChartInstance.current.destroy();
      }

      const ctx = performanceChartRef.current.getContext('2d');
      if (ctx) {
        performanceChartInstance.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [
              {
                label: 'Tweets Posted',
                data: [12, 8, 15, 10, 14, 9, 11],
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
              },
              {
                label: 'Engagement',
                data: [45, 32, 68, 44, 58, 37, 48],
                borderColor: '#10B981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                labels: {
                  color: '#CBD5E1'
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: 'rgba(71, 85, 105, 0.5)'
                },
                ticks: {
                  color: '#94A3B8'
                }
              },
              x: {
                grid: {
                  color: 'rgba(71, 85, 105, 0.5)'
                },
                ticks: {
                  color: '#94A3B8'
                }
              }
            }
          }
        });
      }
    }

    return () => {
      if (performanceChartInstance.current) {
        performanceChartInstance.current.destroy();
      }
    };
  }, [analytics]);

  useEffect(() => {
    if (engagementChartRef.current) {
      // Destroy existing chart
      if (engagementChartInstance.current) {
        engagementChartInstance.current.destroy();
      }

      const ctx = engagementChartRef.current.getContext('2d');
      if (ctx) {
        engagementChartInstance.current = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Likes', 'Retweets', 'Comments'],
            datasets: [{
              data: [65, 25, 10],
              backgroundColor: ['#3B82F6', '#10B981', '#F59E0B'],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  color: '#CBD5E1',
                  padding: 20
                }
              }
            }
          }
        });
      }
    }

    return () => {
      if (engagementChartInstance.current) {
        engagementChartInstance.current.destroy();
      }
    };
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Performance Chart */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Tweet Performance</CardTitle>
            <Select defaultValue="7days">
              <SelectTrigger className="w-32 bg-slate-700 border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <canvas ref={performanceChartRef}></canvas>
          </div>
        </CardContent>
      </Card>

      {/* Engagement Chart */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Engagement Breakdown</CardTitle>
          <div className="flex space-x-2 mt-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-600/20 text-blue-400">
              <div className="w-2 h-2 bg-blue-600 rounded-full mr-1"></div>
              Likes
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-600/20 text-green-400">
              <div className="w-2 h-2 bg-green-600 rounded-full mr-1"></div>
              Retweets
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-600/20 text-yellow-400">
              <div className="w-2 h-2 bg-yellow-600 rounded-full mr-1"></div>
              Comments
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <canvas ref={engagementChartRef}></canvas>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
