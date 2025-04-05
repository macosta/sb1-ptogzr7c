import React, { useState } from 'react';
import Modal from './Modal';
import useGuitarStore from '../../store/useGuitarStore';
import { cn } from '../../lib/utils';
import { 
  User, 
  Lock, 
  Bell, 
  Globe, 
  Sun, 
  Moon, 
  Shield, 
  Database, 
  HelpCircle, 
  FileText, 
  LogOut, 
  Upload, 
  Mail,
  Save
} from 'lucide-react';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ open, onOpenChange }) => {
  const { 
    theme,
    setTheme
  } = useGuitarStore();
  
  // State for settings categories
  const [activeTab, setActiveTab] = useState<'app' | 'profile' | 'account' | 'additional'>('app');
  
  // Profile state
  const [profilePicture, setProfilePicture] = useState('/default-avatar.jpg');
  const [displayName, setDisplayName] = useState('Guitar Player');
  const [bio, setBio] = useState('I love playing guitar!');
  const [email, setEmail] = useState('user@example.com');
  
  // Account settings state
  const [notifications, setNotifications] = useState(true);
  const [privacy, setPrivacy] = useState('public');
  const [language, setLanguage] = useState('english');
  
  // Additional settings state
  const [dataUsage, setDataUsage] = useState('normal');
  const [micAccess, setMicAccess] = useState(true);
  
  // Password change state
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Save changes confirmation
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  
  // Handle picture upload
  const handlePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicture(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle save changes
  const handleSaveChanges = () => {
    setShowSaveConfirmation(true);
    setTimeout(() => {
      setShowSaveConfirmation(false);
    }, 2000);
  };
  
  // Handle password change
  const handlePasswordChange = () => {
    if (newPassword === confirmPassword) {
      // Password change logic would go here
      setShowPasswordChange(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowSaveConfirmation(true);
      setTimeout(() => {
        setShowSaveConfirmation(false);
      }, 2000);
    }
  };
  
  return (
    <Modal
      title="Settings"
      open={open}
      onOpenChange={onOpenChange}
      className="max-w-4xl"
    >
      <div className="flex h-[70vh] max-h-[600px]">
        {/* Settings Navigation Sidebar */}
        <div className="w-52 border-r border-gray-200 dark:border-metal-darkest pr-4">
          <div className="space-y-1">
            <button
              className={cn(
                "flex items-center space-x-2 w-full px-3 py-2 text-sm rounded-md transition-all duration-300",
                activeTab === 'app'
                  ? "bg-metal-blue text-white shadow-neon-blue"
                  : "hover:bg-gray-100 dark:hover:bg-metal-darkest text-gray-700 dark:text-metal-silver"
              )}
              onClick={() => setActiveTab('app')}
            >
              <Sun className="w-4 h-4" />
              <span>App Settings</span>
            </button>
            
            <button
              className={cn(
                "flex items-center space-x-2 w-full px-3 py-2 text-sm rounded-md transition-all duration-300",
                activeTab === 'profile'
                  ? "bg-metal-blue text-white shadow-neon-blue"
                  : "hover:bg-gray-100 dark:hover:bg-metal-darkest text-gray-700 dark:text-metal-silver"
              )}
              onClick={() => setActiveTab('profile')}
            >
              <User className="w-4 h-4" />
              <span>User Profile</span>
            </button>
            
            <button
              className={cn(
                "flex items-center space-x-2 w-full px-3 py-2 text-sm rounded-md transition-all duration-300",
                activeTab === 'account'
                  ? "bg-metal-blue text-white shadow-neon-blue"
                  : "hover:bg-gray-100 dark:hover:bg-metal-darkest text-gray-700 dark:text-metal-silver"
              )}
              onClick={() => setActiveTab('account')}
            >
              <Lock className="w-4 h-4" />
              <span>Account Settings</span>
            </button>
            
            <button
              className={cn(
                "flex items-center space-x-2 w-full px-3 py-2 text-sm rounded-md transition-all duration-300",
                activeTab === 'additional'
                  ? "bg-metal-blue text-white shadow-neon-blue"
                  : "hover:bg-gray-100 dark:hover:bg-metal-darkest text-gray-700 dark:text-metal-silver"
              )}
              onClick={() => setActiveTab('additional')}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Additional Settings</span>
            </button>
            
            <div className="pt-4 mt-4 border-t border-gray-200 dark:border-metal-darkest">
              <button className="flex items-center space-x-2 w-full px-3 py-2 text-sm rounded-md transition-all duration-300 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400">
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Settings Content */}
        <div className="flex-1 pl-6 pr-2 py-2 overflow-y-auto">
          {/* App Settings Tab */}
          {activeTab === 'app' && (
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-gray-800 dark:text-metal-lightblue pb-2 border-b border-gray-200 dark:border-metal-darkest">
                App Settings
              </h2>
              
              {/* Theme Settings */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-metal-silver">
                    {theme === 'light' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    <span>App Theme</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      className={cn(
                        "px-3 py-1 text-sm font-medium rounded-md transition-all duration-300",
                        theme === 'light'
                          ? "bg-metal-blue text-white shadow-neon-blue"
                          : "bg-gray-100 dark:bg-metal-darkest text-gray-700 dark:text-metal-silver"
                      )}
                      onClick={() => setTheme('light')}
                    >
                      Light
                    </button>
                    <button
                      className={cn(
                        "px-3 py-1 text-sm font-medium rounded-md transition-all duration-300",
                        theme === 'dark'
                          ? "bg-metal-blue text-white shadow-neon-blue"
                          : "bg-gray-100 dark:bg-metal-darkest text-gray-700 dark:text-metal-silver"
                      )}
                      onClick={() => setTheme('dark')}
                    >
                      Dark
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200 dark:border-metal-darkest">
                <h3 className="text-sm font-medium text-gray-800 dark:text-metal-lightblue mb-2">
                  App Information
                </h3>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-metal-silver">Version</span>
                    <span className="text-sm font-medium text-gray-800 dark:text-metal-lightblue">1.2.0</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-metal-silver">Made with</span>
                    <span className="text-sm font-medium text-gray-800 dark:text-metal-lightblue">React + Vite + Tailwind</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* User Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-gray-800 dark:text-metal-lightblue pb-2 border-b border-gray-200 dark:border-metal-darkest">
                User Profile
              </h2>
              
              {/* Profile Picture */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative w-24 h-24 mb-4">
                  <img
                    src={profilePicture}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-2 border-metal-blue dark:border-metal-lightblue"
                  />
                  <label className="absolute bottom-0 right-0 bg-metal-blue dark:bg-metal-lightblue rounded-full p-1.5 cursor-pointer shadow-md">
                    <Upload className="w-4 h-4 text-white" />
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handlePictureUpload}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500 dark:text-metal-silver">Click the button to upload a profile picture</p>
              </div>
              
              {/* Display Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-metal-silver mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-metal-darker bg-white dark:bg-metal-darkest text-gray-800 dark:text-metal-silver focus:outline-none focus:ring-1 focus:ring-metal-blue"
                />
              </div>
              
              {/* Bio */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-metal-silver mb-1">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-metal-darker bg-white dark:bg-metal-darkest text-gray-800 dark:text-metal-silver focus:outline-none focus:ring-1 focus:ring-metal-blue"
                />
              </div>
              
              {/* Email */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-metal-silver mb-1">
                  Email Address
                </label>
                <div className="flex items-center">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-md border border-gray-300 dark:border-metal-darker bg-white dark:bg-metal-darkest text-gray-800 dark:text-metal-silver focus:outline-none focus:ring-1 focus:ring-metal-blue"
                  />
                  <button className="ml-2 px-3 py-2 bg-metal-blue text-white rounded-md hover:bg-metal-lightblue transition-colors">
                    <Mail className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-metal-silver mt-1">
                  Your email is used for account recovery and notifications
                </p>
              </div>
              
              {/* Save Button */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSaveChanges}
                  className="px-4 py-2 bg-metal-blue text-white rounded-md shadow-neon-blue hover:bg-metal-lightblue transition-colors duration-300 flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Profile</span>
                </button>
              </div>
            </div>
          )}
          
          {/* Account Settings Tab */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-gray-800 dark:text-metal-lightblue pb-2 border-b border-gray-200 dark:border-metal-darkest">
                Account Settings
              </h2>
              
              {/* Password Section */}
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-800 dark:text-metal-lightblue mb-3">
                  Security
                </h3>
                
                {!showPasswordChange ? (
                  <button
                    onClick={() => setShowPasswordChange(true)}
                    className="px-4 py-2 bg-gray-100 dark:bg-metal-darkest text-gray-700 dark:text-metal-silver rounded-md hover:bg-gray-200 dark:hover:bg-metal-darker transition-colors flex items-center space-x-2"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Change Password</span>
                  </button>
                ) : (
                  <div className="space-y-3 bg-gray-50 dark:bg-metal-darkest p-4 rounded-md">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-metal-silver mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-metal-darker bg-white dark:bg-metal-dark text-gray-800 dark:text-metal-silver focus:outline-none focus:ring-1 focus:ring-metal-blue"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-metal-silver mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-metal-darker bg-white dark:bg-metal-dark text-gray-800 dark:text-metal-silver focus:outline-none focus:ring-1 focus:ring-metal-blue"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-metal-silver mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-metal-darker bg-white dark:bg-metal-dark text-gray-800 dark:text-metal-silver focus:outline-none focus:ring-1 focus:ring-metal-blue"
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setShowPasswordChange(false)}
                        className="px-3 py-1.5 bg-gray-100 dark:bg-metal-dark text-gray-700 dark:text-metal-silver rounded-md hover:bg-gray-200 dark:hover:bg-metal-darker transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handlePasswordChange}
                        className="px-3 py-1.5 bg-metal-blue text-white rounded-md hover:bg-metal-lightblue transition-colors"
                      >
                        Update Password
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Privacy Settings */}
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-800 dark:text-metal-lightblue mb-3">
                  Privacy
                </h3>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-metal-darkest rounded-md">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-metal-silver">Profile Visibility</h4>
                      <p className="text-xs text-gray-500 dark:text-metal-silver mt-0.5">Control who can see your profile</p>
                    </div>
                    <select
                      value={privacy}
                      onChange={(e) => setPrivacy(e.target.value)}
                      className="px-2 py-1 rounded-md border border-gray-300 dark:border-metal-darker bg-white dark:bg-metal-dark text-gray-800 dark:text-metal-silver focus:outline-none focus:ring-1 focus:ring-metal-blue text-sm"
                    >
                      <option value="public">Public</option>
                      <option value="friends">Friends Only</option>
                      <option value="private">Private</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Notification Preferences */}
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-800 dark:text-metal-lightblue mb-3">
                  Notifications
                </h3>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-metal-darkest rounded-md">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-metal-silver">Email Notifications</h4>
                      <p className="text-xs text-gray-500 dark:text-metal-silver mt-0.5">Receive updates via email</p>
                    </div>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={notifications}
                        onChange={() => setNotifications(!notifications)}
                        className="sr-only"
                        id="notifications"
                      />
                      <label
                        htmlFor="notifications"
                        className={cn(
                          "block w-11 h-6 rounded-full transition-colors duration-300",
                          notifications ? "bg-metal-blue" : "bg-gray-300 dark:bg-metal-dark"
                        )}
                      >
                        <span
                          className={cn(
                            "block w-4 h-4 mt-1 ml-1 rounded-full bg-white transition-transform duration-300",
                            notifications && "transform translate-x-5"
                          )}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Language Selection */}
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-800 dark:text-metal-lightblue mb-3">
                  Language
                </h3>
                
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-gray-600 dark:text-metal-silver" />
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="px-2 py-1 rounded-md border border-gray-300 dark:border-metal-darker bg-white dark:bg-metal-darkest text-gray-800 dark:text-metal-silver focus:outline-none focus:ring-1 focus:ring-metal-blue text-sm"
                  >
                    <option value="english">English</option>
                    <option value="spanish">Spanish</option>
                    <option value="french">French</option>
                    <option value="german">German</option>
                    <option value="japanese">Japanese</option>
                  </select>
                </div>
              </div>
              
              {/* Save Button */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSaveChanges}
                  className="px-4 py-2 bg-metal-blue text-white rounded-md shadow-neon-blue hover:bg-metal-lightblue transition-colors duration-300 flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Settings</span>
                </button>
              </div>
            </div>
          )}
          
          {/* Additional Settings Tab */}
          {activeTab === 'additional' && (
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-gray-800 dark:text-metal-lightblue pb-2 border-b border-gray-200 dark:border-metal-darkest">
                Additional Settings
              </h2>
              
              {/* App Permissions */}
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-800 dark:text-metal-lightblue mb-3">
                  App Permissions
                </h3>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-metal-darkest rounded-md">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-metal-silver">Microphone Access</h4>
                      <p className="text-xs text-gray-500 dark:text-metal-silver mt-0.5">Required for tuner functionality</p>
                    </div>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={micAccess}
                        onChange={() => setMicAccess(!micAccess)}
                        className="sr-only"
                        id="mic-permission"
                      />
                      <label
                        htmlFor="mic-permission"
                        className={cn(
                          "block w-11 h-6 rounded-full transition-colors duration-300",
                          micAccess ? "bg-metal-blue" : "bg-gray-300 dark:bg-metal-dark"
                        )}
                      >
                        <span
                          className={cn(
                            "block w-4 h-4 mt-1 ml-1 rounded-full bg-white transition-transform duration-300",
                            micAccess && "transform translate-x-5"
                          )}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Data Usage */}
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-800 dark:text-metal-lightblue mb-3">
                  Data Usage
                </h3>
                
                <div className="flex items-center space-x-2">
                  <Database className="w-4 h-4 text-gray-600 dark:text-metal-silver" />
                  <select
                    value={dataUsage}
                    onChange={(e) => setDataUsage(e.target.value)}
                    className="px-2 py-1 rounded-md border border-gray-300 dark:border-metal-darker bg-white dark:bg-metal-darkest text-gray-800 dark:text-metal-silver focus:outline-none focus:ring-1 focus:ring-metal-blue text-sm"
                  >
                    <option value="low">Low Data Usage</option>
                    <option value="normal">Normal Data Usage</option>
                    <option value="high">High Quality (More Data)</option>
                  </select>
                </div>
              </div>
              
              {/* Help & Support */}
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-800 dark:text-metal-lightblue mb-3">
                  Help & Support
                </h3>
                
                <div className="space-y-2">
                  <button className="flex items-center space-x-2 w-full px-3 py-2 text-sm bg-gray-50 dark:bg-metal-darkest rounded-md text-gray-700 dark:text-metal-silver hover:bg-gray-100 dark:hover:bg-metal-darker transition-colors text-left">
                    <HelpCircle className="w-4 h-4" />
                    <span>Contact Support</span>
                  </button>
                  
                  <button className="flex items-center space-x-2 w-full px-3 py-2 text-sm bg-gray-50 dark:bg-metal-darkest rounded-md text-gray-700 dark:text-metal-silver hover:bg-gray-100 dark:hover:bg-metal-darker transition-colors text-left">
                    <FileText className="w-4 h-4" />
                    <span>View Documentation</span>
                  </button>
                </div>
              </div>
              
              {/* Legal */}
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-800 dark:text-metal-lightblue mb-3">
                  Legal
                </h3>
                
                <div className="space-y-2">
                  <button className="flex items-center space-x-2 w-full px-3 py-2 text-sm bg-gray-50 dark:bg-metal-darkest rounded-md text-gray-700 dark:text-metal-silver hover:bg-gray-100 dark:hover:bg-metal-darker transition-colors text-left">
                    <FileText className="w-4 h-4" />
                    <span>Terms of Service</span>
                  </button>
                  
                  <button className="flex items-center space-x-2 w-full px-3 py-2 text-sm bg-gray-50 dark:bg-metal-darkest rounded-md text-gray-700 dark:text-metal-silver hover:bg-gray-100 dark:hover:bg-metal-darker transition-colors text-left">
                    <Shield className="w-4 h-4" />
                    <span>Privacy Policy</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Success Notification */}
      {showSaveConfirmation && (
        <div className="absolute bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg flex items-center space-x-2 animate-in fade-in-0">
          <span>Changes saved successfully!</span>
        </div>
      )}
      
      {/* Footer */}
      <div className="mt-6 flex justify-end pt-4 border-t border-gray-200 dark:border-metal-darkest">
        <button
          onClick={() => onOpenChange(false)}
          className="px-4 py-2 bg-metal-blue text-white rounded-md shadow-neon-blue hover:bg-metal-lightblue transition-colors duration-300"
        >
          Close
        </button>
      </div>
    </Modal>
  );
};

export default SettingsModal;