/**
 * ZENITH AI - DIET & NUTRITIONAL BRAIN-FUEL PLANNER
 * Curates clean, energizing meals and smart brain snacks synchronized with study/focus routines.
 */

const DIET_PRESETS = {
  'clean-energy': {
    title: 'Sustained Mental Focus & Clean Energy',
    description: 'Low-glycemic complex carbs, high antioxidant berries, omega-3s, and steady cognitive energy.',
    breakfast: {
      name: 'Brain-Fuel Rolled Oats & Chia Power Bowl',
      ingredients: ['1/2 cup rolled oats', '1 tbsp chia seeds', 'Handful of fresh blueberries', '1 tbsp crushed walnuts', 'Drizzle of pure raw honey', 'Almond or oat milk'],
      benefits: 'Omega-3 fatty acids for neuron signaling and sustained fiber energy without mid-morning crashes.'
    },
    lunch: {
      name: 'Rainbow Quinoa Bowl with Lean Protein',
      ingredients: ['Tri-color quinoa', 'Steamed broccoli & baby spinach', 'Grilled paneer, tofu, or chicken breast', 'Sliced avocado & tahini lemon dressing'],
      benefits: 'Complete amino acid profile + lutein and healthy fats to support brain executive function.'
    },
    snacks: [
      { name: 'Walnut & 85% Dark Chocolate Nibbles', desc: 'Flavonoids and magnesium for sharp recall.' },
      { name: 'Sliced Apple with Pure Almond Butter', desc: 'Natural fructose and healthy fats for clean focus boost.' },
      { name: 'Chilled Coconut Water with Chia', desc: 'Natural electrolytes for cellular hydration.' }
    ],
    dinner: {
      name: 'Warm Lentil & Roasted Vegetable Medley',
      ingredients: ['Warm red/green lentils soup', 'Roasted sweet potatoes, bell peppers, zucchini', 'Olive oil & fresh rosemary'],
      benefits: 'Gentle digestion promoting serotonin and melatonin synthesis for restorative deep sleep.'
    }
  },
  'high-protein': {
    title: 'High Protein & Active Performance',
    description: 'Fuel for muscle recovery, physical stamina, and sharp dopamine synthesis for deep work.',
    breakfast: {
      name: 'Triple-Egg Scramble with Avocado & Sprouted Toast',
      ingredients: ['3 organic pasture-raised eggs (or 150g firm tofu)', 'Baby spinach & cherry tomatoes', '1 slice sourdough or sprouted grain toast', '1/2 sliced ripe avocado'],
      benefits: 'Choline for memory synthesis and 24g clean protein.'
    },
    lunch: {
      name: 'Mediterranean Salmon / Herb Tempeh Salad',
      ingredients: ['Wild-caught salmon or grilled tempeh', 'Mixed dark greens, cucumber, olives', 'Extra virgin olive oil and pumpkin seeds'],
      benefits: 'Rich in EPA/DHA to combat brain fatigue and protect cellular membranes.'
    },
    snacks: [
      { name: 'Greek Yogurt with Pumpkin Seeds', desc: 'Probiotics + zinc for immunity and focus.' },
      { name: 'Boiled Egg & Sea Salt Edamame', desc: 'Quick 12g protein snack to destroy afternoon cravings.' },
      { name: 'Matcha Green Tea with Collagen/Pea Protein', desc: 'L-Theanine plus caffeine for smooth, jitter-free flow.' }
    ],
    dinner: {
      name: 'Turkey/Lentil Stuffed Bell Peppers & Greens',
      ingredients: ['Lean turkey mince or seasoned lentils', 'Baked bell peppers', 'Steamed asparagus with garlic'],
      benefits: 'Tryptophan-rich protein that helps transition the body to evening rest.'
    }
  },
  'plant-powered': {
    title: '100% Plant-Powered Vitality',
    description: 'Phytonutrient-dense, fiber-rich whole foods for cellular repair and mental clarity.',
    breakfast: {
      name: 'Green Goddess Smoothie & Seed Crunch Toast',
      ingredients: ['1 cup baby spinach & kale', '1 frozen banana', '1 tbsp hemp seeds & flaxseeds', 'Matcha powder & coconut water'],
      benefits: 'Instant bioavailable chlorophyll and vitamins for morning alertness.'
    },
    lunch: {
      name: 'Chickpea Shakshuka & Ancient Grains',
      ingredients: ['Slow-simmered chickpeas in cumin tomato stew', 'Farro or brown basmati rice', 'Fresh cilantro & toasted pine nuts'],
      benefits: 'Slow-burn carbohydrates to power long study and coding sessions.'
    },
    snacks: [
      { name: 'Roasted Spiced Chickpeas', desc: 'Crunchy savory fiber snack.' },
      { name: 'Guacamole with Carrot & Cucumber Sticks', desc: 'Carotenoids and healthy fats.' },
      { name: 'Herbal Peppermint Tea', desc: 'Aromatherapy focus and digestive calm.' }
    ],
    dinner: {
      name: 'Creamy Butternut Squash & Tofu Curry',
      ingredients: ['Roasted butternut squash', 'Light coconut milk & turmeric ginger broth', 'Pan-seared cubes of firm tofu', 'Steamed bok choy'],
      benefits: 'Potent anti-inflammatory curcumin to soothe systemic fatigue.'
    }
  }
};

const SNACK_GENERATOR_DATABASE = [
  { name: 'Raw Walnuts + Dark Chocolate (85%)', prep: '1 min', benefit: 'Direct DHA support & blood flow to brain' },
  { name: 'Sliced Green Apple + Peanut Butter', prep: '2 min', benefit: 'Stable glycogen release without insulin crash' },
  { name: 'Greek Yogurt + Blueberries + Honey', prep: '2 min', benefit: 'Potent anthocyanins for active memory' },
  { name: 'Steamed Edamame with Sea Salt', prep: '4 min', benefit: 'Plant protein & amino acids for dopamine' },
  { name: 'Celery & Carrot Sticks + Garlic Hummus', prep: '2 min', benefit: 'Hydrating crunchy fiber for mid-day slump' },
  { name: 'Warm Golden Turmeric Milk with Black Pepper', prep: '3 min', benefit: 'Soothes nervous system before sleep' },
  { name: 'Handful of Pumpkin Seeds + Dried Cranberries', prep: '1 min', benefit: 'High zinc & magnesium for calmness' }
];

class DietPlanner {
  static getPlan(goalKey) {
    return DIET_PRESETS[goalKey] || DIET_PRESETS['clean-energy'];
  }

  static getRandomSnack() {
    const idx = Math.floor(Math.random() * SNACK_GENERATOR_DATABASE.length);
    return SNACK_GENERATOR_DATABASE[idx];
  }
}

window.DietPlanner = DietPlanner;
