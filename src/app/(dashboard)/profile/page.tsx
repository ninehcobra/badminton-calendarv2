'use client'

import React from 'react';
import { UserProfile } from '@/presentation/features/profile/UserProfile';

export default function ProfilePage() {
    return <UserProfile isOwnProfile={true} />;
}
