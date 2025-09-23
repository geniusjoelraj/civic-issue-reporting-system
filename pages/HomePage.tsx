import React, { useState, useEffect, useMemo } from 'react';
import { Issue } from '../types';
import * as api from '../services/api';
import IssueCard from '../components/IssueCard';
import { Card } from '../components/ui';

const TrendingTopics: React.FC<{issues: Issue[]}> = ({ issues }) => {
    const trendingTags = useMemo(() => {
        const tagCount: {[key: string]: number} = {};
        issues.forEach(issue => {
            issue.tags.forEach(tag => {
                tagCount[tag] = (tagCount[tag] || 0) + 1;
            });
        });
        return Object.entries(tagCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
    }, [issues]);

    return (
        <Card className="sticky top-8">
            <h2 className="text-lg font-bold text-white mb-4">Trending Topics</h2>
            <div className="space-y-2">
                {trendingTags.map(([tag, count]) => (
                    <div key={tag} className="flex justify-between items-center text-sm">
                        <span className="font-medium text-dark-200">{tag}</span>
                        <span className="text-dark-400">{count} reports</span>
                    </div>
                ))}
            </div>
        </Card>
    );
};

const HomePage: React.FC = () => {
    const [issues, setIssues] = useState<Issue[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchIssues = async () => {
            try {
                const fetchedIssues = await api.getIssues();
                setIssues(fetchedIssues);
            } catch (error) {
                console.error("Failed to fetch issues:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchIssues();
    }, []);

    if (loading) {
        return <div className="text-center p-8">Loading issues...</div>;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
                {issues.length > 0 ? (
                    issues.map(issue => <IssueCard key={issue.id} issue={issue} />)
                ) : (
                    <Card>
                      <p className="text-center text-dark-400 py-8">No issues reported yet. Be the first!</p>
                    </Card>
                )}
            </div>
            <div className="hidden lg:block lg:col-span-1">
                {issues.length > 0 && <TrendingTopics issues={issues}/>}
            </div>
        </div>
    );
};

export default HomePage;
