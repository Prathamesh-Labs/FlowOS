/**
 * FLOWOS - NUTRITION & FUEL PLANNER (V2.0)
 * Curates clean, energizing meals and smart brain snacks synchronized with daily focus routines.
 */

const DIET_PRESETS = {
  'clean-energy': {
    title: 'Sustained Mental Focus & Clean Energy',
    description: 'Low-glycemic complex carbs, high antioxidant berries, omega-3s, and steady energy.',
    breakfast: {
      name: 'Rolled Oats & Chia Power Bowl',
      ingredients: ['1/2 cup rolled oats', '1 tbsp chia seeds', 'Handful of fresh berries', '1 tbsp crushed walnuts', 'Drizzle of honey', 'Almond or oat milk'],
      benefits: 'Healthy fats and complex fiber for sustained morning energy without crashes.'
    },
    lunch: {
      name: 'Rainbow Quinoa Bowl with Lean Protein',
      ingredients: ['Tri-color quinoa', 'Steamed broccoli & baby spinach', 'Grilled paneer, tofu, or chicken breast', 'Sliced avocado & tahini lemon dressing'],
      benefits: 'Complete amino acid profile + healthy fats to support afternoon focus.'
    },
    snacks: [
      { name: 'Walnut & Dark Chocolate Nibbles', desc: 'Flavonoids and magnesium for clean focus.' },
      { name: 'Sliced Apple with Pure Almond Butter', desc: 'Natural fructose and healthy fats for an afternoon boost.' },
      { name: 'Chilled Coconut Water with Chia', desc: 'Natural electrolytes for cellular hydration.' }
    ],
    dinner: {
      name: 'Warm Lentil & Roasted Vegetable Medley',
      ingredients: ['Warm red/green lentils soup', 'Roasted sweet potatoes, bell peppers, zucchini', 'Olive oil & fresh rosemary'],
      benefits: 'Gentle digestion supporting restful evening recovery.'
    }
  },
  'high-protein': {
    title: 'High Protein & Active Performance',
    description: 'Fuel for muscle recovery, physical stamina, and sharp focus for deep work.',
    breakfast: {
      name: 'Egg Scramble with Avocado & Sprouted Toast',
      ingredients: ['3 eggs (or 150g firm tofu)', 'Baby spinach & cherry tomatoes', '1 slice sourdough or sprouted grain toast', '1/2 sliced ripe avocado'],
      benefits: 'Choline and 24g clean protein for morning energy.'
    },
    lunch: {
      name: 'Mediterranean Salmon / Herb Tempeh Salad',
      ingredients: ['Salmon or grilled tempeh', 'Mixed dark greens, cucumber, olives', 'Extra virgin olive oil and pumpkin seeds'],
      benefits: 'Rich in healthy fats to combat fatigue.'
    },
    snacks: [
      { name: 'Greek Yogurt with Pumpkin Seeds', desc: 'Protein + zinc for sustained satiety.' },
      { name: 'Boiled Egg & Sea Salt Edamame', desc: 'Quick clean protein snack.' },
      { name: 'Matcha Green Tea', desc: 'L-Theanine plus natural caffeine for calm flow.' }
    ],
    dinner: {
      name: 'Turkey/Lentil Stuffed Bell Peppers & Greens',
      ingredients: ['Lean turkey mince or seasoned lentils', 'Baked bell peppers', 'Steamed asparagus with garlic'],
      benefits: 'Balanced meal promoting restorative evening rest.'
    }
  },
  'plant-powered': {
    title: '100% Plant-Powered Vitality',
    description: 'Phytonutrient-dense, fiber-rich whole foods for cellular repair and mental clarity.',
    breakfast: {
      name: 'Green Smoothie & Seed Crunch Toast',
      ingredients: ['1 cup baby spinach & kale', '1 frozen banana', '1 tbsp hemp seeds & flaxseeds', 'Matcha powder & coconut water'],
      benefits: 'Rich in bioavailable micronutrients and antioxidants.'
    },
    lunch: {
      name: 'Warm Chickpea Buddha Bowl with Turmeric Dressing',
      ingredients: ['1.5 cups roasted chickpeas', 'Brown rice or cauliflower rice', 'Roasted beets, edamame, and cucumber slices', 'Turmeric ginger tahini dressing'],
      benefits: 'Complex carbohydrates and anti-inflammatory spices.'
    },
    snacks: [
      { name: 'Raw Almonds & Dried Figs', desc: 'Trace minerals and natural focus energy.' },
      { name: 'Hummus with Carrot & Cucumber Sticks', desc: 'Crunchy fiber snack.' },
      { name: 'Golden Milk Turmeric Tea', desc: 'Warm soothing evening beverage.' }
    ],
    dinner: {
      name: 'Creamy Coconut Butternut Squash Soup & Sourdough',
      ingredients: ['Velvety butternut squash & ginger soup', 'Coconut milk swirl & roasted pepitas', 'Toasted artisan sourdough bread slice'],
      benefits: 'Comforting, high-potassium dinner supporting relaxation.'
    }
  }
};

class DietPlannerController {
  static getPreset(key) {
    return DIET_PRESETS[key] || DIET_PRESETS['clean-energy'];
  }
}

window.DietPlannerController = DietPlannerController;
