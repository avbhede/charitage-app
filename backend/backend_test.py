import requests
import sys
import json
from datetime import datetime

class NGOAPITester:
    def __init__(self, base_url="https://charity-connect-pro.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.created_resources = {
            'user_id': None,
            'campaign_id': None,
            'volunteer_id': None,
            'donation_id': None
        }

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                return False, {}

        except requests.exceptions.RequestException as e:
            print(f"❌ Failed - Network Error: {str(e)}")
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_user_registration(self):
        """Test user registration"""
        test_user = {
            "name": f"Test User {datetime.now().strftime('%H%M%S')}",
            "email": f"test_{datetime.now().strftime('%H%M%S')}@example.com",
            "password": "TestPass123!",
            "phone": "9876543210",
            "pan": "ABCDE1234F"
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=test_user
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_id = response['user']['id']
            self.created_resources['user_id'] = self.user_id
            print(f"   Registered user ID: {self.user_id}")
            return True
        return False

    def test_user_login(self):
        """Test user login - using pre-existing user"""
        login_data = {
            "email": "admin@sevasetu.org",
            "password": "admin123"
        }
        
        success, response = self.run_test(
            "User Login",
            "POST", 
            "auth/login",
            200,
            data=login_data
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_id = response['user']['id']
            print(f"   Logged in user ID: {self.user_id}")
            return True
        return False

    def test_get_current_user(self):
        """Test get current user"""
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200
        )
        return success

    def test_get_campaigns(self):
        """Test getting all campaigns"""
        success, response = self.run_test(
            "Get All Campaigns",
            "GET",
            "campaigns",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} campaigns")
            if len(response) > 0:
                self.created_resources['campaign_id'] = response[0]['id']
            return True
        return False

    def test_get_active_campaigns(self):
        """Test getting active campaigns"""
        success, response = self.run_test(
            "Get Active Campaigns",
            "GET",
            "campaigns?status=active",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} active campaigns")
            return True
        return False

    def test_get_single_campaign(self):
        """Test getting single campaign"""
        if not self.created_resources['campaign_id']:
            print("⚠️  Skipping single campaign test - no campaign ID available")
            return True
            
        success, response = self.run_test(
            "Get Single Campaign",
            "GET", 
            f"campaigns/{self.created_resources['campaign_id']}",
            200
        )
        return success

    def test_create_donation_order(self):
        """Test creating donation order"""
        donation_data = {
            "campaign_id": self.created_resources['campaign_id'],
            "amount": 1000.0,
            "donor_name": "Test Donor",
            "donor_email": "donor@example.com",
            "donor_phone": "9876543210",
            "donor_pan": "ABCDE1234F"
        }
        
        success, response = self.run_test(
            "Create Donation Order",
            "POST",
            "donations/create-order",
            200,
            data=donation_data
        )
        
        if success and 'order_id' in response:
            self.created_resources['donation_id'] = response.get('donation_id')
            print(f"   Created donation order: {response['order_id']}")
            return True
        return False

    def test_get_user_donations(self):
        """Test getting user donations"""
        if not self.user_id:
            print("⚠️  Skipping user donations test - no user ID available")
            return True
            
        success, response = self.run_test(
            "Get User Donations",
            "GET",
            f"donations/user/{self.user_id}",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} donations for user")
            return True
        return False

    def test_get_blogs(self):
        """Test getting all blogs"""
        success, response = self.run_test(
            "Get All Blogs",
            "GET",
            "blogs",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} blogs")
            return True
        return False

    def test_create_volunteer(self):
        """Test volunteer application"""
        volunteer_data = {
            "name": f"Test Volunteer {datetime.now().strftime('%H%M%S')}",
            "email": f"volunteer_{datetime.now().strftime('%H%M%S')}@example.com",
            "phone": "9876543210",
            "interest_area": "Education",
            "message": "I want to help with teaching children."
        }
        
        success, response = self.run_test(
            "Create Volunteer Application",
            "POST",
            "volunteers",
            200,
            data=volunteer_data
        )
        
        if success and 'id' in response:
            self.created_resources['volunteer_id'] = response['id']
            print(f"   Created volunteer application ID: {response['id']}")
            return True
        return False

    def test_get_team(self):
        """Test getting team members"""
        success, response = self.run_test(
            "Get Team Members",
            "GET",
            "team",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} team members")
            return True
        return False

    def test_get_gallery(self):
        """Test getting gallery items"""
        success, response = self.run_test(
            "Get Gallery Items",
            "GET",
            "gallery",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} gallery items")
            return True
        return False

    def test_get_gallery_photos(self):
        """Test getting gallery photos"""
        success, response = self.run_test(
            "Get Gallery Photos",
            "GET",
            "gallery?type=photo",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} gallery photos")
            return True
        return False

    def test_get_documents(self):
        """Test getting documents"""
        success, response = self.run_test(
            "Get Documents",
            "GET",
            "documents",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} documents")
            return True
        return False

    def test_get_stats(self):
        """Test getting impact stats"""
        success, response = self.run_test(
            "Get Impact Stats",
            "GET",
            "stats",
            200
        )
        
        if success and 'total_beneficiaries' in response:
            print(f"   Stats - Beneficiaries: {response['total_beneficiaries']}, Funds: ₹{response['total_funds_raised']}")
            return True
        return False

def main():
    """Main test execution"""
    print("🚀 Starting NGO Website Backend API Tests")
    print("=" * 50)
    
    tester = NGOAPITester()
    
    # Test sequence
    test_results = []
    
    # Auth Tests
    print("\n📋 AUTHENTICATION TESTS")
    test_results.append(("User Registration", tester.test_user_registration()))
    test_results.append(("User Login (fallback)", tester.test_user_login()))
    test_results.append(("Get Current User", tester.test_get_current_user()))
    
    # Campaign Tests  
    print("\n📋 CAMPAIGN TESTS")
    test_results.append(("Get All Campaigns", tester.test_get_campaigns()))
    test_results.append(("Get Active Campaigns", tester.test_get_active_campaigns()))
    test_results.append(("Get Single Campaign", tester.test_get_single_campaign()))
    
    # Donation Tests
    print("\n📋 DONATION TESTS")
    test_results.append(("Create Donation Order", tester.test_create_donation_order()))
    test_results.append(("Get User Donations", tester.test_get_user_donations()))
    
    # Content Tests
    print("\n📋 CONTENT TESTS")
    test_results.append(("Get Blogs", tester.test_get_blogs()))
    test_results.append(("Create Volunteer", tester.test_create_volunteer()))
    test_results.append(("Get Team", tester.test_get_team()))
    test_results.append(("Get Gallery", tester.test_get_gallery()))
    test_results.append(("Get Gallery Photos", tester.test_get_gallery_photos()))
    test_results.append(("Get Documents", tester.test_get_documents()))
    test_results.append(("Get Impact Stats", tester.test_get_stats()))
    
    # Final Results
    print("\n" + "=" * 50)
    print("🎯 TEST RESULTS SUMMARY")
    print("=" * 50)
    
    passed_tests = []
    failed_tests = []
    
    for test_name, passed in test_results:
        if passed:
            passed_tests.append(test_name)
            print(f"✅ {test_name}")
        else:
            failed_tests.append(test_name)
            print(f"❌ {test_name}")
    
    success_rate = (tester.tests_passed / tester.tests_run) * 100 if tester.tests_run > 0 else 0
    print(f"\n📊 Overall Success Rate: {tester.tests_passed}/{tester.tests_run} ({success_rate:.1f}%)")
    
    if failed_tests:
        print(f"\n⚠️  Failed Tests: {', '.join(failed_tests)}")
    
    return 0 if success_rate >= 80 else 1

if __name__ == "__main__":
    sys.exit(main())