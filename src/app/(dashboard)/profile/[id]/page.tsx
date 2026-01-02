'use client'

import React, { use } from 'react';
import { UserProfile } from '@/presentation/features/profile/UserProfile';

export default function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    return <UserProfile userId={id} isOwnProfile={false} />;
}
