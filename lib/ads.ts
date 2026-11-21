/**
 * CineMate Internal Advertising Configuration
 *
 * Switch `enabled: true` to activate your configured video advertisements.
 * Set `enabled: false` for a direct, uninterrupted viewing experience.
 *
 * SAFETY GUARANTEES:
 * - Ads always play directly inside the CineMate player area.
 * - Never opens pop-ups, new tabs, or redirects users away from CineMate.
 * - Skip Ad button appears automatically after `skipAfterSeconds`.
 */

export interface AdConfig {
  /** Master switch to turn the CineMate ad engine on or off */
  enabled: boolean;

  /** Play ad before the main content begins */
  showPreRoll: boolean;

  /** Play ad at designated midway markers (future expansion) */
  showMidRoll: boolean;

  /** Play ad after main content concludes (future expansion) */
  showPostRoll?: boolean;

  /** Display optional non-intrusive banner overlay (future expansion) */
  showBanner?: boolean;

  /** Display optional non-intrusive overlay banner (future expansion) */
  showOverlay?: boolean;

  /** Expected maximum duration of the ad video in seconds */
  adDuration: number;

  /** Optional link/label associated with the sponsor */
  adUrl?: string;

  /**
   * Direct authorized video URL for the advertisement (e.g. MP4 or WebM stream).
   * If enabled is true but this URL is empty, the player safely falls back to main video.
   */
  adVideoUrl?: string;

  /** Whether viewers are permitted to skip the advertisement */
  skipEnabled: boolean;

  /** Seconds before the Skip Ad button becomes clickable */
  skipAfterSeconds: number;
}

export const adConfig: AdConfig = {
  enabled: false,

  showPreRoll: true,
  showMidRoll: false,
  showPostRoll: false,
  showBanner: false,
  showOverlay: false,

  adDuration: 10,

  adUrl: "",
  adVideoUrl: "",

  skipEnabled: true,
  skipAfterSeconds: 5
};
