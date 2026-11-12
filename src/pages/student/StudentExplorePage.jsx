import React from 'react';
import { PortalLayout } from '../../components/PortalLayout.jsx';
import { ExploreView } from '../../components/ExploreView.jsx';

export function StudentExplorePage() {
  return (
    <PortalLayout role="student">
      <ExploreView isPublic={false} />
    </PortalLayout>
  );
}
