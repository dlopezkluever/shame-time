-- Insert default app categories based on PRD specifications

-- Bad Apps (Time spent here significantly raises the shame score)
INSERT INTO app_categories (app_name, app_bundle_id, category, default_time_limit_minutes) VALUES
('TikTok', 'com.ss.android.ugc.tiktok', 'bad', 30),
('TikTok', 'com.zhiliaoapp.musically', 'bad', 30), -- Alternative bundle ID
('Instagram', 'com.instagram.android', 'bad', 45),
('Facebook', 'com.facebook.katana', 'bad', 60),
('X', 'com.twitter.android', 'bad', 45), -- X (formerly Twitter)
('Pinterest', 'com.pinterest', 'bad', 60),
('Tumblr', 'com.tumblr', 'bad', 60),
('Snapchat', 'com.snapchat.android', 'bad', 45),
('Netflix', 'com.netflix.mediaclient', 'bad', 120),
('Disney+', 'com.disney.disneyplus.android', 'bad', 120),
('Hulu', 'com.hulu.plus', 'bad', 120),
('Amazon Prime Video', 'com.amazon.avod.thirdpartyclient', 'bad', 120),
('HBO Max', 'com.hbo.android', 'bad', 120),
('Twitch', 'tv.twitch.android.app', 'bad', 90),
('Reddit', 'com.reddit.frontpage', 'bad', 60),
('9GAG', 'com.ninegag.android.app', 'bad', 45),
('Vine', 'co.vine.android', 'bad', 30),
('BeReal', 'com.bereal.ft', 'bad', 15),
('VSCO', 'com.vsco.android', 'bad', 45),
('Candy Crush', 'com.king.candycrushsaga', 'bad', 30),
('PUBG Mobile', 'com.tencent.ig', 'bad', 60),
('Fortnite', 'com.epicgames.fortnite', 'bad', 60),
('Among Us', 'com.innersloth.spacemafia', 'bad', 45),
('Clash of Clans', 'com.supercell.clashofclans', 'bad', 45),
('Clash Royale', 'com.supercell.clashroyale', 'bad', 45);

-- iOS specific bundle IDs for bad apps
INSERT INTO app_categories (app_name, app_bundle_id, category, default_time_limit_minutes) VALUES
('Instagram', 'com.burbn.instagram', 'bad', 45),
('Facebook', 'com.facebook.Facebook', 'bad', 60),
('X', 'com.atebits.Tweetie2', 'bad', 45),
('Pinterest', 'pinterest', 'bad', 60),
('Snapchat', 'com.toyopagroup.picaboo', 'bad', 45),
('Netflix', 'com.netflix.Netflix', 'bad', 120),
('Hulu', 'com.hulu.Hulu', 'bad', 120),
('Amazon Prime Video', 'com.amazon.aiv.AIVApp', 'bad', 120),
('Twitch', 'tv.twitch', 'bad', 90),
('Reddit', 'com.reddit.Reddit', 'bad', 60),
('BeReal', 'AlexisBarreyat.BeReal', 'bad', 15),
('Candy Crush', 'com.midasplayer.apps.candycrushsaga', 'bad', 30);

-- Neutral Apps (Less significant impact on shame score)
INSERT INTO app_categories (app_name, app_bundle_id, category, default_time_limit_minutes) VALUES
('YouTube', 'com.google.android.youtube', 'neutral', 90),
('YouTube', 'com.google.ios.youtube', 'neutral', 90), -- iOS
('Spotify', 'com.spotify.music', 'neutral', 180),
('Spotify', 'com.spotify.client', 'neutral', 180), -- iOS
('Apple Music', 'com.apple.android.music', 'neutral', 180),
('Apple Music', 'com.apple.Music', 'neutral', 180), -- iOS
('Pandora', 'com.pandora.android', 'neutral', 180),
('SoundCloud', 'com.soundcloud.android', 'neutral', 120),
('Podcast', 'com.google.android.apps.podcasts', 'neutral', 240),
('Apple Podcasts', 'com.apple.podcasts', 'neutral', 240), -- iOS
('Maps', 'com.google.android.apps.maps', 'neutral', 60),
('Apple Maps', 'com.apple.Maps', 'neutral', 60), -- iOS
('Weather', 'com.google.android.googlequicksearchbox', 'neutral', 30),
('News', 'com.google.android.apps.magazines', 'neutral', 60),
('Apple News', 'com.apple.news', 'neutral', 60); -- iOS

-- Good Apps (Time spent here lowers the shame score - "goodie points")
INSERT INTO app_categories (app_name, app_bundle_id, category, default_time_limit_minutes) VALUES
('Duolingo', 'com.duolingo', 'good', NULL), -- No limit on good apps
('Duolingo', 'com.duolingo.DuolingoMobile', 'good', NULL), -- iOS
('Khan Academy', 'org.khanacademy.android', 'good', NULL),
('Khan Academy', 'org.khanacademy.ipad', 'good', NULL), -- iOS
('Kindle', 'com.amazon.kindle', 'good', NULL),
('Kindle', 'com.amazon.Lassen', 'good', NULL), -- iOS
('Audible', 'com.audible.application', 'good', NULL),
('Audible', 'com.audible.iphone', 'good', NULL), -- iOS
('Quizlet', 'com.quizlet.quizletandroid', 'good', NULL),
('Quizlet', 'com.quizlet.quizletiphoneapp', 'good', NULL), -- iOS
('Coursera', 'org.coursera.android', 'good', NULL),
('Udemy', 'com.udemy.android', 'good', NULL),
('edX', 'org.edx.mobile', 'good', NULL),
('Brilliant', 'org.brilliant.android', 'good', NULL),
('Lumosity', 'com.lumoslabs.lumosity', 'good', NULL),
('Peak', 'com.brainbow.peak.app', 'good', NULL),
('Elevate', 'com.elevateapp.elevate', 'good', NULL),
('Memrise', 'com.memrise.android.memrisecompanion', 'good', NULL),
('Babbel', 'com.babbel.mobile.android.en', 'good', NULL),
('Rosetta Stone', 'air.com.rosettastone.mobile.CoursePlayer', 'good', NULL),
('LinkedIn Learning', 'com.linkedin.android.learning', 'good', NULL),
('TED', 'com.ted.android', 'good', NULL),
('Medium', 'com.medium.reader', 'good', NULL),
('Pocket', 'com.ideashower.readitlater.pro', 'good', NULL),
('Goodreads', 'com.goodreads', 'good', NULL),
('Forest', 'cc.forestapp', 'good', NULL), -- Focus/productivity app
('Headspace', 'com.getsomeheadspace.android', 'good', NULL),
('Calm', 'com.calm.android', 'good', NULL),
('Insight Timer', 'com.spotlightsix.zentimerlite2', 'good', NULL);

-- Add some common productivity and health apps as good
INSERT INTO app_categories (app_name, app_bundle_id, category, default_time_limit_minutes) VALUES
('Google Docs', 'com.google.android.apps.docs.editors.docs', 'good', NULL),
('Microsoft Word', 'com.microsoft.office.word', 'good', NULL),
('Notion', 'notion.id', 'good', NULL),
('Evernote', 'com.evernote', 'good', NULL),
('Trello', 'com.trello', 'good', NULL),
('Slack', 'com.Slack', 'good', NULL), -- Work communication
('Microsoft Teams', 'com.microsoft.teams', 'good', NULL),
('Zoom', 'us.zoom.videomeetings', 'good', NULL),
('MyFitnessPal', 'com.myfitnesspal.android', 'good', NULL),
('Strava', 'com.strava', 'good', NULL),
('Nike Training Club', 'com.nike.ntc', 'good', NULL),
('Fitbit', 'com.fitbit.FitbitMobile', 'good', NULL),
('Apple Health', 'com.apple.Health', 'good', NULL); -- iOS