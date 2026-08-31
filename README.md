# Fortnite-Like Battle Royale Game

A 3D first-person battle royale game built with Three.js featuring weapons, building mechanics, bots, and cosmetics.

## Features

✅ **Drop Mechanic** - Start by falling from a plane with parachute control
✅ **First-Person View** - Experience the game from your character's perspective
✅ **5 Weapon Slots** - Pistol, Rifle, AK-47, Grenade (with rarity tiers: Copper, Iron, Gold, Diamond)
✅ **Building System** - Build walls and ramps to gain high ground advantage
✅ **Dynamic Environment** - Trees (breakable for materials), buildings with multiple floors, hills, and fields
✅ **Loot System** - Chests scattered around map that open to reveal weapons and med kits
✅ **Bot Enemies** - 20 AI opponents that wander and fight both players and each other
✅ **Health & Healing** - Med kits in chests to restore health
✅ **Shop System** - Buy cosmetic skins with coins earned from eliminating bots
✅ **Damage Indicators** - See damage numbers when you hit enemies
✅ **Realistic Visuals** - Rounded shapes, proper building proportions, and natural environment

## Controls

### Movement & Camera
- **W** - Move Forward
- **S** - Move Backward
- **A** - Move Left
- **D** - Move Right
- **Space** - Jump
- **Mouse** - Look around (camera rotation in-game, aim in menu)

### Combat & Interaction
- **Left Click** - Shoot weapon / Build (in build mode)
- **E** - Interact with chests / Pick up items / Exit build mode
- **R** - Enter/Exit Build Mode

### Building
- **R** (in build mode) - Switch to Ramp
- **B** (in build mode) - Switch to Wall
- **Left Click** - Place structure
- **E** - Cancel build mode

### UI
- Click **START GAME** to begin
- Click **SHOP** to purchase cosmetics
- Coins are earned by defeating bots (50 per kill)

## Gameplay

1. **Drop Phase**: Click anywhere to start dropping from the plane. Move your mouse to aim where you land.

2. **Looting**: 
   - Look for golden glowing chests around the map
   - Press E while looking at a chest to open it
   - Weapons and med kits will pop out
   - Press E again to pick them up

3. **Combat**:
   - Pick up weapons to add them to your inventory (max 5)
   - Click to shoot
   - Different weapons have different damage, fire rates, and ammo capacity
   - Damage numbers appear when you hit enemies

4. **Building**:
   - Press R to enter build mode
   - Press R for ramps (45-degree angle to climb up)
   - Press B for walls (protection)
   - Click to place structures
   - Press E to exit build mode

5. **Environmental Interaction**:
   - Walk into trees to break them (collect materials)
   - Enter buildings through doors (multiple floors to explore)
   - Hide behind structures to avoid bot fire

6. **Healing**:
   - Med kits drop from chests
   - Pick them up with E to restore health

7. **Shop**:
   - Click SHOP in main menu
   - Earn coins by defeating bots
   - Average skin costs 300 coins
   - Get 50 coins per bot eliminated

## Weapon Stats

| Weapon   | Rarity  | Damage | Fire Rate | Magazine | Color   |
|----------|---------|--------|-----------|----------|---------|
| Pistol   | Copper  | 15     | 200ms     | 12       | Copper  |
| Rifle    | Iron    | 35     | 100ms     | 20       | Silver  |
| AK-47    | Gold    | 50     | 80ms      | 30       | Gold    |
| Grenade  | Diamond | 100    | 2000ms    | 5        | Cyan    |

## Game Features in Detail

### Building System
- **Walls**: 5x8 vertical structures for defense
- **Ramps**: 45-degree diagonal ramps to climb up
- Place structures in front of your camera
- Use to gain height advantage or protect from bot fire

### Bot AI
- 20 bots spawn across the map
- They wander randomly and search for players
- Bots deal reduced damage (40% of weapon damage)
- Move slower than players for fair gameplay
- Drop loot when defeated

### Map Elements
- **Trees**: Common throughout map, thin trunk with large foliage crown
- **Buildings**: Multiple-story structures with doors and floors to explore
- **Hills**: Natural elevation for strategic positioning
- **Chests**: Golden glowing boxes containing weapons and med kits
- **Fields**: Open areas requiring caution

### Cosmetics Shop
- **Default Skin** - Free
- **Shadow Skin** - 300 coins
- **Fire Skin** - 300 coins
- **Ice Skin** - 300 coins
- **Neon Skin** - 500 coins
- **Dragon Skin** - 800 coins

## Game Mechanics

- **Falling Damage**: Currently disabled for new players
- **Movement Speed**: 0.15 units per frame
- **Jump Height**: 0.5 units per frame
- **Gravity**: -0.02 acceleration
- **Bot Damage**: 40% reduced compared to weapons
- **Map Size**: 1000x1000 units
- **Draw Distance**: 2000 units with fog effect

## Installation

1. Clone the repository
2. Open `index.html` in a modern web browser (Chrome, Firefox, Safari, Edge)
3. Click "START GAME" to begin

## Requirements

- Modern web browser with WebGL support
- Stable internet connection for Three.js library loading
- Recommended: 60 FPS capable GPU

## Browser Compatibility

✅ Chrome/Chromium
✅ Firefox
✅ Safari
✅ Edge
❌ Internet Explorer (not supported)

## Performance Tips

- For better performance, lower draw distance if getting low FPS
- Close other browser tabs to free up resources
- Disable browser extensions that might interfere with WebGL
- Use fullscreen mode (F11) for immersive experience

## Future Updates

- [ ] Multiplayer support
- [ ] More weapon types
- [ ] Vehicle mechanics
- [ ] Storm/shrinking zone
- [ ] Emotes and dance moves
- [ ] Sound effects
- [ ] Leaderboards
- [ ] Custom skins

## Credits

Built with:
- **Three.js** - 3D graphics library
- **WebGL** - Graphics rendering
- **JavaScript** - Game logic

## License

MIT License - Feel free to modify and distribute!

---

**Enjoy the game! Good luck in the battle royale!** 🎮
