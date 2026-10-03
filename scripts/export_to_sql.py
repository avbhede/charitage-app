import os
import json
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv('backend/.env')
client = MongoClient(os.environ['MONGO_URL'])
db = client['charitage']

def sql_esc(val):
    if val is None:
        return 'NULL'
    if isinstance(val, (int, float)):
        return str(val)
    if isinstance(val, bool):
        return '1' if val else '0'
    if isinstance(val, (list, dict)):
        s = json.dumps(val).replace("'", "\\'")
        return f"'{s}'"
    s = str(val).replace("\\", "\\\\").replace("'", "\\'")
    return f"'{s}'"

lines = [
    "-- Charitage Foundation Initial Seed Data",
    "-- Exported from MongoDB Atlas",
    "USE `charitage`;",
    ""
]

# Users
users = list(db.users.find({}, {'_id': 0}))
if users:
    lines.append('-- 1. Users')
    for u in users:
        hp = u.get('hashed_password', u.get('password', ''))
        lines.append(f"INSERT INTO `users` (`id`, `email`, `name`, `phone`, `pan`, `role`, `hashed_password`, `created_at`) VALUES ({sql_esc(u.get('id'))}, {sql_esc(u.get('email'))}, {sql_esc(u.get('name'))}, {sql_esc(u.get('phone'))}, {sql_esc(u.get('pan'))}, {sql_esc(u.get('role', 'donor'))}, {sql_esc(hp)}, {sql_esc(u.get('created_at'))}) ON DUPLICATE KEY UPDATE `email`=`email`;")
    lines.append('')

# Campaigns
campaigns = list(db.campaigns.find({}, {'_id': 0}))
if campaigns:
    lines.append('-- 2. Campaigns')
    for c in campaigns:
        lines.append(f"INSERT INTO `campaigns` (`id`, `title`, `description`, `category`, `goal_amount`, `raised_amount`, `image_url`, `status`, `beneficiaries_count`, `submitted_by`, `created_at`) VALUES ({sql_esc(c.get('id'))}, {sql_esc(c.get('title'))}, {sql_esc(c.get('description'))}, {sql_esc(c.get('category'))}, {c.get('goal_amount', 0)}, {c.get('raised_amount', 0)}, {sql_esc(c.get('image_url'))}, {sql_esc(c.get('status', 'active'))}, {c.get('beneficiaries_count', 0)}, {sql_esc(c.get('submitted_by'))}, {sql_esc(c.get('created_at'))}) ON DUPLICATE KEY UPDATE `id`=`id`;")
    lines.append('')

# Blogs
blogs = list(db.blogs.find({}, {'_id': 0}))
if blogs:
    lines.append('-- 3. Blogs')
    for b in blogs:
        lines.append(f"INSERT INTO `blogs` (`id`, `title`, `slug`, `excerpt`, `content`, `author`, `image_url`, `category`, `tags`, `published`, `created_at`) VALUES ({sql_esc(b.get('id'))}, {sql_esc(b.get('title'))}, {sql_esc(b.get('slug'))}, {sql_esc(b.get('excerpt'))}, {sql_esc(b.get('content'))}, {sql_esc(b.get('author'))}, {sql_esc(b.get('image_url'))}, {sql_esc(b.get('category'))}, {sql_esc(b.get('tags'))}, {sql_esc(b.get('published', 1))}, {sql_esc(b.get('created_at'))}) ON DUPLICATE KEY UPDATE `id`=`id`;")
    lines.append('')

# Activities
acts = list(db.activities.find({}, {'_id': 0}))
if acts:
    lines.append('-- 4. Activities')
    for a in acts:
        lines.append(f"INSERT INTO `activities` (`id`, `title`, `description`, `category`, `media_type`, `media_url`, `gallery_urls`, `event_date`, `location`, `created_at`) VALUES ({sql_esc(a.get('id'))}, {sql_esc(a.get('title'))}, {sql_esc(a.get('description'))}, {sql_esc(a.get('category'))}, {sql_esc(a.get('media_type', 'image'))}, {sql_esc(a.get('media_url'))}, {sql_esc(a.get('gallery_urls'))}, {sql_esc(a.get('event_date'))}, {sql_esc(a.get('location'))}, {sql_esc(a.get('created_at'))}) ON DUPLICATE KEY UPDATE `id`=`id`;")
    lines.append('')

# Stories
stories = list(db.stories.find({}, {'_id': 0}))
if stories:
    lines.append('-- 5. Stories')
    for s in stories:
        lines.append(f"INSERT INTO `stories` (`id`, `title`, `description`, `featured_image`, `category`, `author`, `created_at`) VALUES ({sql_esc(s.get('id'))}, {sql_esc(s.get('title'))}, {sql_esc(s.get('description'))}, {sql_esc(s.get('featured_image'))}, {sql_esc(s.get('category'))}, {sql_esc(s.get('author'))}, {sql_esc(s.get('created_at'))}) ON DUPLICATE KEY UPDATE `id`=`id`;")
    lines.append('')

# News
news = list(db.news.find({}, {'_id': 0}))
if news:
    lines.append('-- 6. News')
    for n in news:
        lines.append(f"INSERT INTO `news` (`id`, `title`, `excerpt`, `content`, `image_url`, `video_url`, `category`, `tags`, `author`, `published_at`, `created_at`) VALUES ({sql_esc(n.get('id'))}, {sql_esc(n.get('title'))}, {sql_esc(n.get('excerpt'))}, {sql_esc(n.get('content'))}, {sql_esc(n.get('image_url'))}, {sql_esc(n.get('video_url'))}, {sql_esc(n.get('category'))}, {sql_esc(n.get('tags'))}, {sql_esc(n.get('author'))}, {sql_esc(n.get('published_at'))}, {sql_esc(n.get('created_at'))}) ON DUPLICATE KEY UPDATE `id`=`id`;")
    lines.append('')

# Gallery
gallery = list(db.gallery.find({}, {'_id': 0}))
if gallery:
    lines.append('-- 7. Gallery')
    for g in gallery:
        lines.append(f"INSERT INTO `gallery` (`id`, `title`, `type`, `url`, `category`, `created_at`) VALUES ({sql_esc(g.get('id'))}, {sql_esc(g.get('title'))}, {sql_esc(g.get('type', 'image'))}, {sql_esc(g.get('url'))}, {sql_esc(g.get('category'))}, {sql_esc(g.get('created_at'))}) ON DUPLICATE KEY UPDATE `id`=`id`;")
    lines.append('')

# Inquiries
inquiries = list(db.inquiries.find({}, {'_id': 0}))
if inquiries:
    lines.append('-- 8. Inquiries')
    for i in inquiries:
        lines.append(f"INSERT INTO `inquiries` (`id`, `name`, `email`, `phone`, `company_name`, `area_of_interest`, `subject`, `message`, `status`, `created_at`) VALUES ({sql_esc(i.get('id'))}, {sql_esc(i.get('name'))}, {sql_esc(i.get('email'))}, {sql_esc(i.get('phone'))}, {sql_esc(i.get('company_name'))}, {sql_esc(i.get('area_of_interest'))}, {sql_esc(i.get('subject'))}, {sql_esc(i.get('message'))}, {sql_esc(i.get('status', 'new'))}, {sql_esc(i.get('created_at'))}) ON DUPLICATE KEY UPDATE `id`=`id`;")
    lines.append('')

# Donations
donations = list(db.donations.find({}, {'_id': 0}))
if donations:
    lines.append('-- 9. Donations')
    for d in donations:
        is_anon = 1 if d.get('is_anonymous') else 0
        is_rec = 1 if d.get('is_recurring') else 0
        lines.append(f"INSERT INTO `donations` (`id`, `user_id`, `campaign_id`, `amount`, `tip_amount`, `donor_name`, `donor_email`, `donor_phone`, `donor_pan`, `gift_address`, `is_anonymous`, `is_recurring`, `duration_months`, `razorpay_order_id`, `razorpay_payment_id`, `razorpay_subscription_id`, `status`, `created_at`) VALUES ({sql_esc(d.get('id'))}, {sql_esc(d.get('user_id'))}, {sql_esc(d.get('campaign_id'))}, {d.get('amount', 0)}, {d.get('tip_amount', 0)}, {sql_esc(d.get('donor_name'))}, {sql_esc(d.get('donor_email'))}, {sql_esc(d.get('donor_phone'))}, {sql_esc(d.get('donor_pan'))}, {sql_esc(d.get('gift_address'))}, {is_anon}, {is_rec}, {d.get('duration_months', 12)}, {sql_esc(d.get('razorpay_order_id'))}, {sql_esc(d.get('razorpay_payment_id'))}, {sql_esc(d.get('razorpay_subscription_id'))}, {sql_esc(d.get('status', 'completed'))}, {sql_esc(d.get('created_at'))}) ON DUPLICATE KEY UPDATE `id`=`id`;")
    lines.append('')

os.makedirs('backend-php', exist_ok=True)
with open('backend-php/seed.sql', 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))

print('Seed file created successfully with all MongoDB records!')
