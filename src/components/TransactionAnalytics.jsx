import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { format, subDays, eachDayOfInterval } from 'date-fns';

function TransactionAnalytics({ transactions }) {
  const chartData = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    // Get the date range for the last 30 days
    const endDate = new Date();
    const startDate = subDays(endDate, 30);
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

    // Group transactions by date
    const transactionsByDate = transactions.reduce((acc, tx) => {
      const date = format(new Date(tx.timestamp), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = {
          date,
          incoming: 0,
          outgoing: 0,
          volume: 0,
          count: 0
        };
      }
      
      const value = parseFloat(tx.value || 0);
      acc[date].volume += value;
      acc[date].count += 1;
      
      if (tx.type === 'incoming') {
        acc[date].incoming += value;
      } else if (tx.type === 'outgoing') {
        acc[date].outgoing += value;
      }
      
      return acc;
    }, {});

    // Fill in missing dates with zero values
    return dateRange.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const displayDate = format(date, 'MMM dd');
      
      return {
        date: displayDate,
        fullDate: dateStr,
        incoming: transactionsByDate[dateStr]?.incoming || 0,
        outgoing: transactionsByDate[dateStr]?.outgoing || 0,
        volume: transactionsByDate[dateStr]?.volume || 0,
        count: transactionsByDate[dateStr]?.count || 0
      };
    });
  }, [transactions]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600">{entry.name}:</span>
              <span className="font-medium text-gray-900">
                {entry.value.toFixed(4)} ETH
              </span>
            </div>
          ))}
          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-gray-600">Transactions:</span>
              <span className="font-medium text-gray-900">
                {payload[0]?.payload?.count || 0}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (!transactions || transactions.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <BarChart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p>No transaction data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Volume Chart */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Daily Transaction Volume</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="incoming" 
                fill="#10b981" 
                name="Incoming"
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="outgoing" 
                fill="#ef4444" 
                name="Outgoing"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transaction Count Chart */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Daily Transaction Count</h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                        <p className="font-medium text-gray-900 mb-1">{label}</p>
                        <p className="text-sm text-gray-600">
                          {payload[0].value} transactions
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default TransactionAnalytics;
