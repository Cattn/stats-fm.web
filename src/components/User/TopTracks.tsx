import { useApi, useAuth } from '@/hooks';
import formatter from '@/utils/formatter';
import type { Range, TopTrack, UserPublic } from '@statsfm/statsfm.js';
import type { RefObject } from 'react';
import { useState, type FC, useEffect } from 'react';
import { event } from 'nextjs-google-analytics';
import { Carousel } from '../Carousel';
import Scope from '../PrivacyScope';
import {
  Section,
  SectionToolbarGridMode,
  SectionToolbarCarouselNavigation,
  SectionToolbarInfoMenu,
} from '../Section';
import { ShareMenuItem } from '../ShareMenuItem';
import { TrackCard, TrackCardSkeleton } from '../Track';
import { ranges } from './utils';

export const TopTracks: FC<{
  range: Range;
  trackRef: RefObject<HTMLElement>;
  userProfile: UserPublic;
}> = ({ trackRef, userProfile, range }) => {
  const api = useApi();
  const { user: currentUser } = useAuth();
  const [topTracks, setTopTracks] = useState<TopTrack[]>([]);

  useEffect(() => {
    setTopTracks([]);
    api.users.topTracks(userProfile.id, { range }).then(setTopTracks);
  }, [range, userProfile]);

  const isCurrentUser = currentUser?.id === userProfile.id;

  return (
    <Carousel itemHeight={276}>
      <Section
        ref={trackRef}
        title="Top tracks"
        description={`${
          isCurrentUser ? 'Your' : formatter.nounify(userProfile.displayName)
        } top tracks ${ranges[range]}`}
        scope="topTracks"
        toolbar={
          <div className="flex gap-1">
            <SectionToolbarGridMode />
            <SectionToolbarCarouselNavigation
              callback={() => event('USER_top_tracks_previous')}
            />
            <SectionToolbarCarouselNavigation
              next
              callback={() => event('USER_top_tracks_next')}
            />
            <SectionToolbarInfoMenu>
              <ShareMenuItem
                path={`/${userProfile.customId ?? userProfile.id}/tracks`}
              />
            </SectionToolbarInfoMenu>
          </div>
        }
      >
        <Scope value="topTracks">
          {/* <NotEnoughData data={topTracks}> */}

          <Carousel.Items>
            {topTracks.length > 0
              ? topTracks.map((item) => (
                  <Carousel.Item
                    key={item.track.id}
                    onClick={() => event('USER_top_track_click')}
                  >
                    <TrackCard {...item} />
                  </Carousel.Item>
                ))
              : Array(10)
                  .fill(null)
                  .map((_n, i) => (
                    <Carousel.Item key={i}>
                      <TrackCardSkeleton />
                    </Carousel.Item>
                  ))}
          </Carousel.Items>
          {/* </NotEnoughData> */}
        </Scope>
      </Section>
    </Carousel>
  );
};
