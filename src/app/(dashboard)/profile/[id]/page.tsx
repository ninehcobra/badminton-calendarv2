'use client'

import React from 'react';
import { UserProfile } from '@/presentation/features/profile/UserProfile';

export default function UserProfilePage({ params }: { params: { id: string } }) {
    return <UserProfile userId={params.id} isOwnProfile={false} />;
}
