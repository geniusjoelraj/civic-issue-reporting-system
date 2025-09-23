import { DUMMY_ISSUES, DUMMY_USERS, DUMMY_AADHAAR_DB } from '../constants';
import { Issue, User } from '../types';

let issues: Issue[] = [...DUMMY_ISSUES];
let users: User[] = [...DUMMY_USERS];

const simulateDelay = <T,>(data: T, delay = 500): Promise<T> => 
    new Promise(resolve => setTimeout(() => resolve(data), delay));

// --- Auth ---

export const checkUsername = (username: string): Promise<{ unique: boolean }> => 
    simulateDelay({ unique: !users.some(u => u.username === username) });

export const checkEmail = (email: string): Promise<{ unique: boolean }> => 
    simulateDelay({ unique: !users.some(u => u.email === email) });

export const registerUser = (userData: Omit<User, 'id' | 'verified'>): Promise<User> => {
    const newUser: User = {
        ...userData,
        id: `u${users.length + 1}`,
        verified: false,
        joinedDate: new Date().toISOString(),
    };
    users.push(newUser);
    return simulateDelay(newUser);
};

export const verifyOtp = (otp: string, type: 'email' | 'mobile'): Promise<{ success: boolean }> => {
    const correctOtp = type === 'email' ? '123456' : '999999';
    return simulateDelay({ success: otp === correctOtp });
};

export const verifyAadhaar = (aadhaar: string): Promise<{ success: boolean }> => {
    return simulateDelay({ success: DUMMY_AADHAAR_DB.has(aadhaar) });
};

export const finalizeVerification = (userId: string): Promise<User | null> => {
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex > -1) {
        users[userIndex].verified = true;
        return simulateDelay(users[userIndex]);
    }
    return simulateDelay(null);
};

export const login = (email: string): Promise<User | null> => {
    const user = users.find(u => u.email === email && u.verified);
    return simulateDelay(user || null);
};

// --- Issues ---

export const getIssues = (): Promise<Issue[]> => {
    return simulateDelay([...issues].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
};

export const getIssueById = (id: string): Promise<Issue | null> => {
    const issue = issues.find(i => i.id === id);
    return simulateDelay(issue || null);
};

export const createIssue = (issueData: Omit<Issue, 'id' | 'createdAt' | 'upvotes' | 'reposts'>): Promise<Issue> => {
    const newIssue: Issue = {
        ...issueData,
        id: `i${issues.length + 1}`,
        createdAt: new Date().toISOString(),
        upvotes: 0,
        reposts: 0,
    };
    issues.unshift(newIssue);
    return simulateDelay(newIssue);
};

export const updateIssueStatus = (id: string, status: Issue['status'], updateText: string, authorityId: string): Promise<Issue | null> => {
    const issueIndex = issues.findIndex(i => i.id === id);
    if (issueIndex > -1) {
        issues[issueIndex].status = status;
        const newUpdate = { updatedBy: authorityId, timestamp: new Date().toISOString(), updateText };
        issues[issueIndex].updates = [...(issues[issueIndex].updates || []), newUpdate];
        return simulateDelay(issues[issueIndex]);
    }
    return simulateDelay(null);
};

export const upvoteIssue = (id: string): Promise<{ upvotes: number } | null> => {
    const issueIndex = issues.findIndex(i => i.id === id);
    if (issueIndex > -1) {
        issues[issueIndex].upvotes += 1;
        return simulateDelay({ upvotes: issues[issueIndex].upvotes });
    }
    return simulateDelay(null);
};

export const repostIssue = (id: string): Promise<{ reposts: number } | null> => {
    const issueIndex = issues.findIndex(i => i.id === id);
    if (issueIndex > -1) {
        issues[issueIndex].reposts += 1;
        return simulateDelay({ reposts: issues[issueIndex].reposts });
    }
    return simulateDelay(null);
};

// --- Profile ---
export const getUserById = (userId: string): Promise<User | null> => {
    const user = users.find(u => u.id === userId);
    return simulateDelay(user || null);
};

export const getIssuesByAuthor = (authorId: string): Promise<Issue[]> => {
    const userIssues = issues.filter(i => i.authorId === authorId);
    return simulateDelay(userIssues.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
};

export const getIssuesByAuthority = (authorityId: string): Promise<Issue[]> => {
    const managedIssues = issues.filter(i => i.updates?.some(u => u.updatedBy === authorityId));
    return simulateDelay(managedIssues.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
}