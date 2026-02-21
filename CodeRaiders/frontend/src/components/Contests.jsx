import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Clock, Plus, Users } from 'lucide-react';

// This is a placeholder service. In a real app, you would fetch data from your backend.
const ContestService = {
  getContests: async () => {
    // Simulate an API call
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([
          {
            _id: 'c1',
            title: 'Weekly Programming Challenge #15',
            status: 'Live',
            startTime: new Date(Date.now() - 3600000), // 1 hour ago
            endTime: new Date(Date.now() + 7200000), // 2 hours from now
            participants: 125,
            creator: 'Admin'
          },
          {
            _id: 'c2',
            title: 'Monthly Algorithm Sprint',
            status: 'Upcoming',
            startTime: new Date(Date.now() + 86400000), // 1 day from now
            endTime: new Date(Date.now() + 172800000), // 2 days from now
            participants: 0,
            creator: 'Admin'
          },
          {
            _id: 'c3',
            title: 'Beginner\'s First Contest',
            status: 'Ended',
            startTime: new Date(Date.now() - 172800000), // 2 days ago
            endTime: new Date(Date.now() - 86400000), // 1 day ago
            participants: 80,
            creator: 'User1'
          }
        ]);
      }, 1000); // Simulate a network delay of 1 second
    });
  },
};

// Helper function to determine the color of the status badge
const getStatusColor = (status) => {
  switch (status) {
    case 'Live':
      return 'bg-red-500/20 text-red-400 border-red-400';
    case 'Upcoming':
      return 'bg-blue-500/20 text-blue-400 border-blue-400';
    case 'Ended':
      return 'bg-gray-500/20 text-gray-400 border-gray-400';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-400';
  }
};

// Helper function to format dates for display
const formatContestTime = (date) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(date).toLocaleString('en-US', options);
};

const Contests = () => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const data = await ContestService.getContests();
        setContests(data);
      } catch (err) {
        setError('Failed to fetch contests. Please try again.');
        console.error('Error fetching contests:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchContests();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400 text-lg">Loading contests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-lg p-8 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-red-400 text-lg font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <Trophy className="w-8 h-8" />
            Contests
          </h2>
          <Link to="/contests/new" className="bg-blue-800 hover:bg-blue-400 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2">
            <Plus className="w-5 h-5" />
            Create Contest
          </Link>
        </div>
        
        <div className="space-y-6">
          {contests.length > 0 ? (
            contests.map((contest) => (
              <div 
                key={contest._id} 
                className="bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group hover:ring-2 hover:ring-blue-500/50"
              >
                <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-white group-hover:text-blue-300 transition-colors">
                        {contest.title}
                      </h3>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(contest.status)}`}>
                        {contest.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-slate-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>
                          {contest.status === 'Ended' ? 'Ended' : 'Starts'}: {formatContestTime(contest.startTime)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{contest.participants} participants</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <Link to={`/contests/${contest._id}`} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors duration-200">
                      {contest.status === 'Ended' ? 'View Leaderboard' : 'Join Contest'}
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-slate-800 rounded-xl p-12 text-center">
              <Trophy className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-300 mb-2">No Contests Available</h3>
              <p className="text-slate-400 mb-6">
                Check back soon for new and exciting coding challenges!
              </p>
              <Link to="/contests/new" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2 mx-auto w-fit">
                <Plus className="w-5 h-5" />
                Create a New Contest
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contests;
