import React, { useState, useEffect } from 'react';
import { Target } from 'lucide-react';

const CaloriPathApp = () => {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [selectedTab, setSelectedTab] = useState('home');

  const [userProfile, setUserProfile] = useState({
    age: 25,
    sex: 'female',
    height: 170,
    currentWeight: 75,
    goalWeight: 70,
    activityLevel: 1.55,
    activityLevelName: 'Moderately Active',
    weightLossPace: 'moderate',
    bmr: 0,
    tdee: 0,
    dailyTarget: 0
  });

  const [foodLogs, setFoodLogs] = useState([]);
  const [showAddFood, setShowAddFood] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMealType, setSelectedMealType] = useState('breakfast');
  const [waterCups, setWaterCups] = useState(0);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [activePlan, setActivePlan] = useState(null);
  const [planStartDate, setPlanStartDate] = useState(null);
  const [dailyWeighIns, setDailyWeighIns] = useState({});
  const [showWeighInModal, setShowWeighInModal] = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const [showQuitModal, setShowQuitModal] = useState(false);
  const waterGoal = 8;

  const foodDatabase = [
    { name: 'Oatmeal with berries (1 cup)', calories: 250 },
    { name: 'Scrambled eggs (2 large)', calories: 140 },
    { name: 'Coffee with milk', calories: 50 },
    { name: 'Chicken salad', calories: 350 },
    { name: 'Apple (medium)', calories: 95 },
    { name: 'Banana (medium)', calories: 105 },
    { name: 'Greek yogurt (1 cup)', calories: 150 },
    { name: 'Almonds (1 oz)', calories: 160 },
    { name: 'Chicken breast (100g)', calories: 165 },
    { name: 'Brown rice (1 cup)', calories: 215 },
    { name: 'Broccoli (1 cup)', calories: 55 },
    { name: 'Salmon (100g)', calories: 208 },
    { name: 'Avocado (half)', calories: 120 },
    { name: 'Pasta (1 cup cooked)', calories: 221 },
    { name: 'Pizza slice (cheese)', calories: 237 },
    { name: 'Burger', calories: 520 },
  ];

  const dietPlans = [
    {
      id: 1,
      name: 'Intermittent Fasting 16:8',
      description: 'Fast for 16 hours, eat within 8-hour window',
      icon: '⏰',
      details: 'Eat between 12pm-8pm daily. Skip breakfast, have lunch and dinner.',
      benefits: ['Improved insulin sensitivity', 'Enhanced fat burning', 'Simplified meal planning'],
      difficulty: 'Medium',
      duration: 21,
      recipeIds: [2, 3, 5, 8, 10, 11]
    },
    {
      id: 2,
      name: 'Keto Diet',
      description: 'High fat, low carb',
      icon: '🥑',
      details: 'Consume 70% fat, 25% protein, 5% carbs.',
      benefits: ['Rapid weight loss', 'Reduced appetite', 'Mental clarity'],
      difficulty: 'Hard',
      duration: 28,
      recipeIds: [1, 3, 7, 11, 12]
    },
  ];

  const recipes = [
    {
      id: 1,
      name: 'Grilled Chicken Salad',
      category: 'Lunch',
      calories: 350,
      prepTime: '15 min',
      servings: 1,
      image: '🥗',
      ingredients: ['150g chicken breast', '2 cups mixed greens', '1/2 cup cherry tomatoes'],
      instructions: 'Grill chicken and serve over greens.',
      macros: { protein: 35, carbs: 15, fat: 18 }
    },
  ];

  useEffect(() => {
    calculateCalories();
  }, []);

  const calculateCalories = () => {
    const { age, sex, height, currentWeight, activityLevel, weightLossPace } = userProfile;

    let bmr;
    if (sex === 'male') {
      bmr = (10 * currentWeight) + (6.25 * height) - (5 * age) + 5;
    } else {
      bmr = (10 * currentWeight) + (6.25 * height) - (5 * age) - 161;
    }

    const tdee = bmr * activityLevel;

    let deficit = 0;
    if (weightLossPace === 'conservative') deficit = 250;
    else if (weightLossPace === 'moderate') deficit = 500;
    else if (weightLossPace === 'aggressive') deficit = 750;

    let dailyTarget = tdee - deficit;
    const minCalories = sex === 'male' ? 1500 : 1200;
    if (dailyTarget < minCalories) dailyTarget = minCalories;

    setUserProfile(prev => ({
      ...prev,
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      dailyTarget: Math.round(dailyTarget)
    }));
  };

  const calculateTimeline = () => {
    const weightToLose = userProfile.currentWeight - userProfile.goalWeight;
    const lbsToLose = weightToLose * 2.20462;
    const totalCaloriesNeeded = lbsToLose * 3500;
    const deficit = userProfile.tdee - userProfile.dailyTarget;
    const daysToGoal = totalCaloriesNeeded / deficit;
    const monthsToGoal = (daysToGoal / 30).toFixed(1);
    return { days: Math.round(daysToGoal), months: monthsToGoal };
  };

  const getTodayLogs = () => {
    const today = new Date().toDateString();
    return foodLogs.filter(log => new Date(log.timestamp).toDateString() === today);
  };

  const getTodayCalories = () => {
    return getTodayLogs().reduce((sum, log) => sum + log.calories, 0);
  };

  const getMealCalories = (mealType) => {
    return getTodayLogs()
      .filter(log => log.mealType === mealType)
      .reduce((sum, log) => sum + log.calories, 0);
  };

  const addFoodLog = (food) => {
    const newLog = {
      id: Date.now(),
      name: food.name,
      calories: food.calories,
      mealType: selectedMealType,
      timestamp: new Date().toISOString()
    };
    setFoodLogs([...foodLogs, newLog]);
    setShowAddFood(false);
    setSearchQuery('');
  };

  const deleteFoodLog = (id) => {
    setFoodLogs(foodLogs.filter(log => log.id !== id));
  };

  const toggleWaterCup = (index) => {
    if (index < waterCups) {
      setWaterCups(index);
    } else {
      setWaterCups(index + 1);
    }
  };

  const syncCaloriesBurned = () => {
    const randomCalories = Math.floor(Math.random() * 500) + 200;
    setCaloriesBurned(randomCalories);
  };

  const startPlan = (plan) => {
    setActivePlan(plan);
    setPlanStartDate(new Date().toISOString());
    setSelectedPlan(null);
    setSelectedTab('activePlan');
  };

  const getDaysInPlan = () => {
    if (!activePlan || !planStartDate) return 0;
    const start = new Date(planStartDate);
    const today = new Date();
    const diffTime = Math.abs(today - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.min(diffDays, activePlan.duration);
  };

  const getDaysRemaining = () => {
    if (!activePlan) return 0;
    return Math.max(0, activePlan.duration - getDaysInPlan());
  };

  const logWeighIn = () => {
    const today = new Date().toDateString();
    const currentWeight = dailyWeighIns[today] || userProfile.currentWeight || '';
    setWeightInput(currentWeight.toString());
    setShowWeighInModal(true);
  };

  const saveWeighIn = () => {
    const parsedWeight = parseFloat(weightInput);

    if (!isNaN(parsedWeight) && parsedWeight > 0 && parsedWeight < 500) {
      const newWeight = parseFloat(parsedWeight.toFixed(1));
      const today = new Date().toDateString();

      setDailyWeighIns(prev => ({
        ...prev,
        [today]: newWeight
      }));

      setUserProfile(prev => ({
        ...prev,
        currentWeight: newWeight
      }));

      setShowWeighInModal(false);
      setWeightInput('');
    } else {
      alert('Please enter a valid weight between 1 and 500 kg');
    }
  };

  const quitPlan = () => {
    setActivePlan(null);
    setPlanStartDate(null);
    setShowQuitModal(false);
    setSelectedTab('plans');
  };

  const getTodayWeighIn = () => {
    const today = new Date().toDateString();
    return dailyWeighIns[today] || null;
  };

  const filteredFoods = foodDatabase.filter(food =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getMealTarget = (mealType) => {
    if (activePlan) {
      const planDistributions = {
        1: { breakfast: 0, lunch: 0.45, dinner: 0.45, snacks: 0.10 },
        2: { breakfast: 0.30, lunch: 0.35, dinner: 0.30, snacks: 0.05 },
      };

      const distribution = planDistributions[activePlan.id];
      return Math.round(userProfile.dailyTarget * distribution[mealType]);
    }

    const distributions = {
      breakfast: 0.25,
      lunch: 0.35,
      dinner: 0.30,
      snacks: 0.10
    };

    return Math.round(userProfile.dailyTarget * distributions[mealType]);
  };

  const todayCalories = getTodayCalories();
  const remaining = userProfile.dailyTarget - todayCalories;
  const todayLogs = getTodayLogs();

  const mealIcons = {
    breakfast: '🍳',
    lunch: '🍔',
    dinner: '🍝',
    snacks: '🍪'
  };

  if (currentScreen === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <Target className="w-20 h-20 mx-auto text-blue-500 mb-4" />
          <h1 className="text-4xl font-bold text-gray-800 mb-2">CaloriPath</h1>
          <p className="text-gray-600 mb-8">Your personalized calorie tracking companion</p>

          <button
            onClick={() => setCurrentScreen('onboarding')}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-4 rounded-xl hover:shadow-lg transition-all"
          >
            Start Your Journey
          </button>
        </div>
      </div>
    );
  }

  if (currentScreen === 'onboarding') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${(onboardingStep / 5) * 100}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">Step {onboardingStep} of 5</p>
          </div>

          {onboardingStep === 5 && (
            <div className="text-center">
              <Target className="w-16 h-16 mx-auto text-green-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Plan</h2>
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-6 mb-4">
                <p className="text-sm opacity-90">Daily Target</p>
                <p className="text-5xl font-bold">{userProfile.dailyTarget}</p>
                <p className="text-sm opacity-90">calories</p>
              </div>
              <button
                onClick={() => setCurrentScreen('app')}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg"
              >
                Start Tracking
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {showQuitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-3">Quit Plan?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to quit this plan?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowQuitModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={quitPlan}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg"
              >
                Quit Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {showWeighInModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Log Your Weight</h3>
            <input
              type="number"
              step="0.1"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              placeholder="Enter weight (kg)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg mb-4"
            />
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowWeighInModal(false);
                  setWeightInput('');
                }}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={saveWeighIn}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold">CaloriPath</h1>
        <p>Calories today: {todayCalories} / {userProfile.dailyTarget}</p>
      </div>
    </div>
  );
};

export default CaloriPathApp;
