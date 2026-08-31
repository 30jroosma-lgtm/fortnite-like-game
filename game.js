// Game Configuration
const CONFIG = {
    mapSize: 1000,
    maxPlayers: 50,
    playerSpeed: 0.15,
    jumpPower: 0.5,
    gravity: -0.02,
    maxHealth: 100,
    maxInventory: 5,
    skyColor: 0x87ceeb,
    groundColor: 0x2d5016
};

// Weapon Definitions
const WEAPONS = {
    pistol: { name: 'Pistol', damage: 15, fireRate: 200, ammoPerShot: 1, magazine: 12, color: 'copper', reloadTime: 1000 },
    rifle: { name: 'Rifle', damage: 35, fireRate: 100, ammoPerShot: 1, magazine: 20, color: 'iron', reloadTime: 1500 },
    ak47: { name: 'AK-47', damage: 50, fireRate: 80, ammoPerShot: 2, magazine: 30, color: 'gold', reloadTime: 2000 },
    grenade: { name: 'Grenade', damage: 100, fireRate: 2000, ammoPerShot: 1, magazine: 5, color: 'diamond', reloadTime: 1000 }
};

const RARITY_COLORS = {
    copper: 0xb87333,
    iron: 0xc0c0c0,
    gold: 0xffd700,
    diamond: 0x00ffff
};

const SKINS = [
    { name: 'Default', price: 0, description: 'Default skin' },
    { name: 'Shadow', price: 300, description: 'Dark ninja skin' },
    { name: 'Fire', price: 300, description: 'Burning flame skin' },
    { name: 'Ice', price: 300, description: 'Frozen ice skin' },
    { name: 'Neon', price: 500, description: 'Glowing neon skin' },
    { name: 'Dragon', price: 800, description: 'Mythical dragon skin' }
];

// Game State
let gameState = {
    isPlaying: false,
    isDropping: true,
    isInBuildMode: false,
    currentWeaponIndex: -1,
    health: CONFIG.maxHealth,
    coins: 0,
    selectedSkin: 'Default',
    inventory: [],
    ammo: {},
    camera: null,
    scene: null,
    renderer: null,
    player: null,
    playerVelocity: { x: 0, y: 0, z: 0 },
    isGrounded: false,
    keys: {},
    mouse: { x: 0, y: 0, locked: false },
    bots: [],
    buildings: [],
    trees: [],
    chests: [],
    groundItems: [],
    buildMode: 'wall'
};

// Initialize Game
function initGame() {
    // Scene setup
    gameState.scene = new THREE.Scene();
    gameState.scene.background = new THREE.Color(CONFIG.skyColor);
    gameState.scene.fog = new THREE.Fog(CONFIG.skyColor, 800, 2000);

    // Camera
    gameState.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    gameState.camera.position.y = 200;

    // Renderer
    gameState.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: document.getElementById('gameCanvas') });
    gameState.renderer.setSize(window.innerWidth, window.innerHeight);
    gameState.renderer.shadowMap.enabled = true;
    gameState.renderer.shadowMap.type = THREE.PCFShadowShadowMap;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    gameState.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 200, 100);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.far = 1000;
    directionalLight.shadow.camera.left = -500;
    directionalLight.shadow.camera.right = 500;
    directionalLight.shadow.camera.top = 500;
    directionalLight.shadow.camera.bottom = -500;
    gameState.scene.add(directionalLight);

    // Create ground
    createGround();

    // Create environment
    createTrees();
    createBuildings();
    createChests();

    // Create player
    createPlayer();

    // Spawn bots
    for (let i = 0; i < 20; i++) {
        spawnBot();
    }

    // Setup controls
    setupControls();
    setupEventListeners();

    // Show drop info
    document.getElementById('dropInfo').style.display = 'block';
    document.getElementById('dropInfo').textContent = 'Click to start dropping! Move mouse to aim. Click again to deploy.';

    // Start game loop
    animate();
}

function createGround() {
    const groundGeometry = new THREE.PlaneGeometry(CONFIG.mapSize, CONFIG.mapSize);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: CONFIG.groundColor });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    gameState.scene.add(ground);

    // Add some hills
    for (let i = 0; i < 10; i++) {
        const hill = new THREE.Mesh(
            new THREE.IcosahedronGeometry(30 + Math.random() * 20, 4),
            new THREE.MeshLambertMaterial({ color: 0x3d6e1f })
        );
        hill.position.set(
            (Math.random() - 0.5) * CONFIG.mapSize * 0.8,
            Math.random() * 20 + 10,
            (Math.random() - 0.5) * CONFIG.mapSize * 0.8
        );
        hill.castShadow = true;
        hill.receiveShadow = true;
        gameState.scene.add(hill);
    }
}

function createTrees() {
    for (let i = 0; i < 150; i++) {
        const tree = createTree(
            (Math.random() - 0.5) * CONFIG.mapSize * 0.9,
            0,
            (Math.random() - 0.5) * CONFIG.mapSize * 0.9
        );
        gameState.trees.push(tree);
    }
}

function createTree(x, y, z) {
    const group = new THREE.Group();
    group.position.set(x, y, z);
    group.userData.health = 100;
    group.userData.isTree = true;

    // Trunk
    const trunkGeometry = new THREE.CylinderGeometry(3, 4, 15, 8);
    const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 7.5;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    group.add(trunk);

    // Foliage (larger top)
    const foliageGeometry = new THREE.IcosahedronGeometry(12, 3);
    const foliageMaterial = new THREE.MeshLambertMaterial({ color: 0x2d5016 });
    const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
    foliage.position.y = 18;
    foliage.castShadow = true;
    foliage.receiveShadow = true;
    group.add(foliage);

    group.castShadow = true;
    gameState.scene.add(group);
    return group;
}

function createBuildings() {
    for (let i = 0; i < 15; i++) {
        const building = createBuilding(
            (Math.random() - 0.5) * CONFIG.mapSize * 0.8,
            0,
            (Math.random() - 0.5) * CONFIG.mapSize * 0.8
        );
        gameState.buildings.push(building);
    }
}

function createBuilding(x, y, z) {
    const group = new THREE.Group();
    group.position.set(x, y, z);
    group.userData.isBuilding = true;

    const width = 30 + Math.random() * 20;
    const height = 40 + Math.random() * 40;
    const depth = 30 + Math.random() * 20;
    const floors = Math.floor(height / 15);

    // Walls
    const wallMaterial = new THREE.MeshLambertMaterial({ color: 0xcccccc });
    
    // Front wall
    const frontGeom = new THREE.BoxGeometry(width, height, 1);
    const front = new THREE.Mesh(frontGeom, wallMaterial);
    front.position.z = depth / 2;
    front.castShadow = true;
    front.receiveShadow = true;
    group.add(front);

    // Back wall
    const back = new THREE.Mesh(frontGeom, wallMaterial);
    back.position.z = -depth / 2;
    back.castShadow = true;
    back.receiveShadow = true;
    group.add(back);

    // Side walls
    const sideGeom = new THREE.BoxGeometry(1, height, depth);
    const left = new THREE.Mesh(sideGeom, wallMaterial);
    left.position.x = -width / 2;
    left.castShadow = true;
    left.receiveShadow = true;
    group.add(left);

    const right = new THREE.Mesh(sideGeom, wallMaterial);
    right.position.x = width / 2;
    right.castShadow = true;
    right.receiveShadow = true;
    group.add(right);

    // Roof
    const roofGeom = new THREE.BoxGeometry(width + 2, 1, depth + 2);
    const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x888888 });
    const roof = new THREE.Mesh(roofGeom, roofMaterial);
    roof.position.y = height / 2;
    roof.castShadow = true;
    roof.receiveShadow = true;
    group.add(roof);

    // Add doors
    for (let i = 0; i < floors; i++) {
        const doorGeom = new THREE.BoxGeometry(4, 6, 0.5);
        const doorMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
        const door = new THREE.Mesh(doorGeom, doorMaterial);
        door.position.set(0, i * 15 + 3, depth / 2);
        door.castShadow = true;
        group.add(door);
    }

    // Add floors
    for (let i = 1; i < floors; i++) {
        const floorGeom = new THREE.BoxGeometry(width - 2, 0.5, depth - 2);
        const floorMaterial = new THREE.MeshLambertMaterial({ color: 0xaa8833 });
        const floor = new THREE.Mesh(floorGeom, floorMaterial);
        floor.position.y = i * 15;
        floor.castShadow = true;
        floor.receiveShadow = true;
        group.add(floor);
    }

    gameState.scene.add(group);
    return group;
}

function createChests() {
    for (let i = 0; i < 30; i++) {
        const chest = createChest(
            (Math.random() - 0.5) * CONFIG.mapSize * 0.85,
            1,
            (Math.random() - 0.5) * CONFIG.mapSize * 0.85
        );
        gameState.chests.push(chest);
    }
}

function createChest(x, y, z) {
    const group = new THREE.Group();
    group.position.set(x, y, z);
    group.userData.isChest = true;
    group.userData.opened = false;

    // Main box
    const boxGeom = new THREE.BoxGeometry(4, 3, 4);
    const boxMaterial = new THREE.MeshLambertMaterial({ color: 0xffd700 });
    const box = new THREE.Mesh(boxGeom, boxMaterial);
    box.castShadow = true;
    box.receiveShadow = true;
    group.add(box);

    // Lid
    const lidGeom = new THREE.BoxGeometry(4.2, 0.5, 4.2);
    const lidMaterial = new THREE.MeshLambertMaterial({ color: 0xffed4e });
    const lid = new THREE.Mesh(lidGeom, lidMaterial);
    lid.position.y = 2;
    lid.castShadow = true;
    group.add(lid);
    group.userData.lid = lid;

    // Glow effect
    const glowGeom = new THREE.BoxGeometry(5, 4, 5);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xffd700,
        transparent: true,
        opacity: 0.1
    });
    const glow = new THREE.Mesh(glowGeom, glowMaterial);
    group.add(glow);

    gameState.scene.add(group);
    return group;
}

function createPlayer() {
    gameState.player = new THREE.Group();
    gameState.player.position.set(0, 200, 0);
    gameState.player.userData.health = CONFIG.maxHealth;
    gameState.player.userData.isPlayer = true;

    // Head
    const headGeom = new THREE.SphereGeometry(2, 16, 16);
    const skinMaterial = new THREE.MeshLambertMaterial({ color: 0xf4a460 });
    const head = new THREE.Mesh(headGeom, skinMaterial);
    head.position.y = 4.5;
    head.castShadow = true;
    gameState.player.add(head);

    // Body
    const bodyGeom = new THREE.BoxGeometry(2.5, 4, 2);
    const body = new THREE.Mesh(bodyGeom, skinMaterial);
    body.position.y = 1;
    body.castShadow = true;
    gameState.player.add(body);

    // Arms
    const armGeom = new THREE.BoxGeometry(1, 4, 1);
    const armMaterial = new THREE.MeshLambertMaterial({ color: 0xf4a460 });
    
    const leftArm = new THREE.Mesh(armGeom, armMaterial);
    leftArm.position.set(-2, 1, 0);
    leftArm.castShadow = true;
    gameState.player.add(leftArm);
    
    const rightArm = new THREE.Mesh(armGeom, armMaterial);
    rightArm.position.set(2, 1, 0);
    rightArm.castShadow = true;
    gameState.player.add(rightArm);

    // Legs
    const legGeom = new THREE.BoxGeometry(1, 4, 1);
    const legMaterial = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
    
    const leftLeg = new THREE.Mesh(legGeom, legMaterial);
    leftLeg.position.set(-1, -3, 0);
    leftLeg.castShadow = true;
    gameState.player.add(leftLeg);
    
    const rightLeg = new THREE.Mesh(legGeom, legMaterial);
    rightLeg.position.set(1, -3, 0);
    rightLeg.castShadow = true;
    gameState.player.add(rightLeg);

    gameState.scene.add(gameState.player);

    // Initialize ammo
    Object.keys(WEAPONS).forEach(key => {
        gameState.ammo[key] = WEAPONS[key].magazine;
    });
}

function spawnBot() {
    const bot = new THREE.Group();
    bot.position.set(
        (Math.random() - 0.5) * CONFIG.mapSize * 0.9,
        10,
        (Math.random() - 0.5) * CONFIG.mapSize * 0.9
    );
    bot.userData.health = CONFIG.maxHealth;
    bot.userData.isBot = true;
    bot.userData.weapon = Object.keys(WEAPONS)[Math.floor(Math.random() * Object.keys(WEAPONS).length)];
    bot.userData.ammo = WEAPONS[bot.userData.weapon].magazine;
    bot.userData.targetPlayer = null;
    bot.userData.moveDirection = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        0,
        (Math.random() - 0.5) * 2
    ).normalize();
    bot.userData.lastShot = 0;

    // Body
    const bodyGeom = new THREE.BoxGeometry(2.5, 4, 2);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xff6b6b });
    const body = new THREE.Mesh(bodyGeom, bodyMaterial);
    body.position.y = 1;
    body.castShadow = true;
    bot.add(body);

    // Head
    const headGeom = new THREE.SphereGeometry(2, 16, 16);
    const head = new THREE.Mesh(headGeom, bodyMaterial);
    head.position.y = 4.5;
    head.castShadow = true;
    bot.add(head);

    gameState.scene.add(bot);
    gameState.bots.push(bot);
}

function createPlayer() {
    gameState.player = new THREE.Group();
    gameState.player.position.set(0, 200, 0);
    gameState.player.userData.health = CONFIG.maxHealth;
    gameState.player.userData.isPlayer = true;

    // Head
    const headGeom = new THREE.SphereGeometry(2, 16, 16);
    const skinMaterial = new THREE.MeshLambertMaterial({ color: 0xf4a460 });
    const head = new THREE.Mesh(headGeom, skinMaterial);
    head.position.y = 4.5;
    head.castShadow = true;
    gameState.player.add(head);

    // Body
    const bodyGeom = new THREE.BoxGeometry(2.5, 4, 2);
    const body = new THREE.Mesh(bodyGeom, skinMaterial);
    body.position.y = 1;
    body.castShadow = true;
    gameState.player.add(body);

    // Arms
    const armGeom = new THREE.BoxGeometry(1, 4, 1);
    const armMaterial = new THREE.MeshLambertMaterial({ color: 0xf4a460 });
    
    const leftArm = new THREE.Mesh(armGeom, armMaterial);
    leftArm.position.set(-2, 1, 0);
    leftArm.castShadow = true;
    gameState.player.add(leftArm);
    
    const rightArm = new THREE.Mesh(armGeom, armMaterial);
    rightArm.position.set(2, 1, 0);
    rightArm.castShadow = true;
    gameState.player.add(rightArm);

    // Legs
    const legGeom = new THREE.BoxGeometry(1, 4, 1);
    const legMaterial = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
    
    const leftLeg = new THREE.Mesh(legGeom, legMaterial);
    leftLeg.position.set(-1, -3, 0);
    leftLeg.castShadow = true;
    gameState.player.add(leftLeg);
    
    const rightLeg = new THREE.Mesh(legGeom, legMaterial);
    rightLeg.position.set(1, -3, 0);
    rightLeg.castShadow = true;
    gameState.player.add(rightLeg);

    gameState.scene.add(gameState.player);

    // Initialize ammo
    Object.keys(WEAPONS).forEach(key => {
        gameState.ammo[key] = WEAPONS[key].magazine;
    });
}

function setupControls() {
    document.addEventListener('keydown', (e) => {
        gameState.keys[e.key.toLowerCase()] = true;
        
        if (e.key === 'e' || e.key === 'E') interactNearby();
        if (e.key === 'r' || e.key === 'R') {
            gameState.isInBuildMode = !gameState.isInBuildMode;
            document.getElementById('buildModeUI').style.display = gameState.isInBuildMode ? 'block' : 'none';
            document.getElementById('crosshair').style.display = gameState.isInBuildMode ? 'none' : 'block';
        }
        if (e.key === 'R' && gameState.isInBuildMode) gameState.buildMode = 'ramp';
        if (e.key === 'B' && gameState.isInBuildMode) gameState.buildMode = 'wall';
    });

    document.addEventListener('keyup', (e) => {
        gameState.keys[e.key.toLowerCase()] = false;
    });

    document.addEventListener('mousemove', (e) => {
        if (gameState.mouse.locked && !gameState.isDropping) {
            gameState.camera.rotation.order = 'YXZ';
            gameState.camera.rotation.y -= e.movementX * 0.005;
            gameState.camera.rotation.x -= e.movementY * 0.005;
            
            gameState.camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, gameState.camera.rotation.x));
        } else {
            gameState.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            gameState.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        }
    });

    document.addEventListener('click', () => {
        if (gameState.isDropping) {
            gameState.isDropping = false;
            document.getElementById('dropInfo').style.display = 'none';
            document.getElementById('crosshair').style.display = 'block';
            document.getElementById('gameUI').style.display = 'block';
            document.getElementById('healthDisplay').style.display = 'block';
            document.getElementById('coinsDisplay').style.display = 'block';
            document.getElementById('controlsHint').style.display = 'block';
            if (document.pointerLockElement === null) {
                document.getElementById('gameCanvas').requestPointerLock();
                gameState.mouse.locked = true;
            }
        } else if (!gameState.isInBuildMode) {
            shootWeapon();
        } else if (gameState.isInBuildMode) {
            buildStructure();
        }
    });

    document.addEventListener('pointerlockchange', () => {
        gameState.mouse.locked = document.pointerLockElement !== null;
    });
}

function setupEventListeners() {
    window.addEventListener('resize', () => {
        gameState.camera.aspect = window.innerWidth / window.innerHeight;
        gameState.camera.updateProjectionMatrix();
        gameState.renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function shootWeapon() {
    if (gameState.currentWeaponIndex === -1 || !gameState.inventory[gameState.currentWeaponIndex]) return;

    const weapon = gameState.inventory[gameState.currentWeaponIndex];
    if (gameState.ammo[weapon] <= 0) return;

    gameState.ammo[weapon] -= WEAPONS[weapon].ammoPerShot;

    // Raycast to find what we hit
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), gameState.camera);

    const bots = gameState.bots;
    const intersects = raycaster.intersectObjects(bots, true);

    if (intersects.length > 0) {
        let bot = intersects[0].object;
        while (bot && !bot.userData.isBot) {
            bot = bot.parent;
        }
        
        if (bot && bot.userData.isBot) {
            const damage = WEAPONS[weapon].damage;
            bot.userData.health -= damage;
            
            showDamageIndicator(bot.position, damage);

            if (bot.userData.health <= 0) {
                gameState.scene.remove(bot);
                gameState.bots = gameState.bots.filter(b => b !== bot);
                gameState.coins += 50;
                spawnBot();
            }
        }
    }

    updateWeaponDisplay();
}

function showDamageIndicator(position, damage) {
    const element = document.createElement('div');
    element.className = 'damage-indicator';
    element.textContent = '-' + damage;
    element.style.left = window.innerWidth / 2 + 'px';
    element.style.top = window.innerHeight / 2 + 'px';
    document.getElementById('ui').appendChild(element);

    setTimeout(() => {
        element.remove();
    }, 1000);
}

function buildStructure() {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), gameState.camera);
    
    // Find intersection point
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const target = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, target);

    if (gameState.buildMode === 'wall') {
        const wallGeom = new THREE.BoxGeometry(5, 8, 0.5);
        const wallMaterial = new THREE.MeshLambertMaterial({ color: 0xffaa00 });
        const wall = new THREE.Mesh(wallGeom, wallMaterial);
        wall.position.copy(gameState.camera.position);
        wall.position.y -= 2;
        wall.castShadow = true;
        gameState.scene.add(wall);
    } else if (gameState.buildMode === 'ramp') {
        const rampGeom = new THREE.BoxGeometry(5, 0.5, 8);
        const rampMaterial = new THREE.MeshLambertMaterial({ color: 0xffaa00 });
        const ramp = new THREE.Mesh(rampGeom, rampMaterial);
        ramp.rotation.z = Math.PI / 4; // 45 degrees
        ramp.position.copy(gameState.camera.position);
        ramp.position.y -= 2;
        ramp.castShadow = true;
        gameState.scene.add(ramp);
    }
}

function interactNearby() {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), gameState.camera);

    const chests = gameState.chests;
    const intersects = raycaster.intersectObjects(chests, true);

    for (let i = 0; i < intersects.length; i++) {
        let chest = intersects[i].object;
        while (chest && !chest.userData.isChest) {
            chest = chest.parent;
        }

        if (chest && chest.userData.isChest && !chest.userData.opened) {
            openChest(chest);
            return;
        }
    }
}

function openChest(chest) {
    chest.userData.opened = true;
    
    // Animate lid opening
    if (chest.userData.lid) {
        const startY = chest.userData.lid.position.y;
        let rotationZ = 0;
        const interval = setInterval(() => {
            rotationZ += 0.1;
            chest.userData.lid.rotation.z = rotationZ;
            if (rotationZ >= Math.PI / 2) {
                clearInterval(interval);
            }
        }, 10);
    }

    // Spawn random item
    const weaponKeys = Object.keys(WEAPONS);
    const randomWeapon = weaponKeys[Math.floor(Math.random() * weaponKeys.length)];
    
    const itemGroup = new THREE.Group();
    itemGroup.position.copy(chest.position);
    itemGroup.position.y += 3;
    itemGroup.userData.weapon = randomWeapon;
    itemGroup.userData.isItem = true;

    // Gun model
    const gunGeom = new THREE.BoxGeometry(1, 0.5, 3);
    const gunMaterial = new THREE.MeshLambertMaterial({ color: RARITY_COLORS[WEAPONS[randomWeapon].color] });
    const gun = new THREE.Mesh(gunGeom, gunMaterial);
    gun.castShadow = true;
    itemGroup.add(gun);

    gameState.scene.add(itemGroup);
    gameState.groundItems.push(itemGroup);

    // Med kit
    const medGeom = new THREE.BoxGeometry(1, 1, 1);
    const medMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
    const medKit = new THREE.Mesh(medGeom, medMaterial);
    medKit.position.set(2, 3, 0);
    medKit.castShadow = true;
    itemGroup.add(medKit);
    itemGroup.userData.medKit = true;
}

function updatePlayerMovement() {
    if (gameState.isDropping) return;

    const moveVector = new THREE.Vector3();

    if (gameState.keys['w']) moveVector.z -= CONFIG.playerSpeed;
    if (gameState.keys['s']) moveVector.z += CONFIG.playerSpeed;
    if (gameState.keys['a']) moveVector.x -= CONFIG.playerSpeed;
    if (gameState.keys['d']) moveVector.x += CONFIG.playerSpeed;

    // Apply camera rotation
    moveVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), gameState.camera.rotation.y);

    gameState.playerVelocity.x = moveVector.x;
    gameState.playerVelocity.z = moveVector.z;

    // Gravity
    gameState.playerVelocity.y += CONFIG.gravity;

    // Jump
    if (gameState.keys[' '] && gameState.isGrounded) {
        gameState.playerVelocity.y = CONFIG.jumpPower;
        gameState.isGrounded = false;
    }

    // Apply velocity
    gameState.player.position.x += gameState.playerVelocity.x;
    gameState.player.position.y += gameState.playerVelocity.y;
    gameState.player.position.z += gameState.playerVelocity.z;

    // Ground collision
    if (gameState.player.position.y <= 1) {
        gameState.player.position.y = 1;
        gameState.playerVelocity.y = 0;
        gameState.isGrounded = true;
    }

    // Map boundaries
    const boundary = CONFIG.mapSize / 2 - 10;
    gameState.player.position.x = Math.max(-boundary, Math.min(boundary, gameState.player.position.x));
    gameState.player.position.z = Math.max(-boundary, Math.min(boundary, gameState.player.position.z));

    // Update camera position
    gameState.camera.position.copy(gameState.player.position);
    gameState.camera.position.y += 2;
}

function updateBots() {
    gameState.bots.forEach(bot => {
        if (!bot.userData.health || bot.userData.health <= 0) return;

        // Simple AI - wander and occasionally attack
        if (Math.random() > 0.95) {
            bot.userData.moveDirection = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                0,
                (Math.random() - 0.5) * 2
            ).normalize();
        }

        bot.position.x += bot.userData.moveDirection.x * 0.05;
        bot.position.z += bot.userData.moveDirection.z * 0.05;

        // Stay within bounds
        const boundary = CONFIG.mapSize / 2 - 20;
        if (Math.abs(bot.position.x) > boundary || Math.abs(bot.position.z) > boundary) {
            bot.userData.moveDirection.negate();
        }

        // Attack player if close
        const distToPlayer = bot.position.distanceTo(gameState.player.position);
        if (distToPlayer < 50) {
            const now = Date.now();
            const weapon = bot.userData.weapon;
            if (now - bot.userData.lastShot > WEAPONS[weapon].fireRate) {
                // Damage player
                const botDamage = WEAPONS[weapon].damage * 0.4; // Bots do less damage
                gameState.player.userData.health -= botDamage;
                bot.userData.lastShot = now;

                updateHealthDisplay();

                if (gameState.player.userData.health <= 0) {
                    endGame();
                }
            }
        }
    });
}

function updateHealthDisplay() {
    document.getElementById('healthDisplay').textContent = `Health: ${Math.ceil(gameState.player.userData.health)}`;
}

function updateWeaponDisplay() {
    if (gameState.currentWeaponIndex === -1) {
        document.getElementById('weaponDisplay').textContent = 'Weapon: None';
        document.getElementById('ammoDisplay').style.display = 'none';
    } else {
        const weapon = gameState.inventory[gameState.currentWeaponIndex];
        document.getElementById('weaponDisplay').textContent = `Weapon: ${WEAPONS[weapon].name}`;
        document.getElementById('ammoDisplay').textContent = `Ammo: ${gameState.ammo[weapon]}`;
        document.getElementById('ammoDisplay').style.display = 'block';
    }
}

function updateDroping() {
    if (!gameState.isDropping) return;

    // Falling down
    gameState.player.position.y -= 0.3;

    if (gameState.player.position.y <= 50) {
        gameState.isDropping = false;
    }

    // Update camera
    gameState.camera.position.copy(gameState.player.position);
    gameState.camera.position.y += 2;
}

function animate() {
    requestAnimationFrame(animate);

    if (gameState.isDropping) {
        updateDroping();
    } else if (gameState.isPlaying || !document.getElementById('menu').style.display === 'none') {
        updatePlayerMovement();
        updateBots();
    }

    gameState.renderer.render(gameState.scene, gameState.camera);
}

function startGame() {
    gameState.isPlaying = true;
    document.getElementById('menu').style.display = 'none';
    document.getElementById('gameUI').style.display = 'block';
    
    if (!gameState.scene) {
        initGame();
    }

    document.getElementById('dropInfo').style.display = 'block';
    document.getElementById('controlsHint').style.display = 'block';
}

function endGame() {
    gameState.isPlaying = false;
    alert(`Game Over! You survived and earned ${gameState.coins} coins!`);
    location.reload();
}

function openShop() {
    document.getElementById('shopMenu').style.display = 'block';
    const shopItems = document.getElementById('shopItems');
    shopItems.innerHTML = '';

    SKINS.forEach((skin, index) => {
        const item = document.createElement('div');
        item.className = 'shop-item';
        item.innerHTML = `
            <div class="shop-item-info">
                <div class="shop-item-name">${skin.name}</div>
                <div style="color: #aaa; font-size: 12px;">${skin.description}</div>
            </div>
            <div class="shop-item-price">${skin.price} 🪙</div>
            <button class="shop-buy-btn" onclick="buySkin(${index})">Buy</button>
        `;
        shopItems.appendChild(item);
    });

    const coinsInfo = document.createElement('div');
    coinsInfo.style.color = '#ffaa00';
    coinsInfo.style.marginTop = '20px';
    coinsInfo.style.textAlign = 'center';
    coinsInfo.textContent = `Your Coins: ${gameState.coins}`;
    shopItems.appendChild(coinsInfo);
}

function closeShop() {
    document.getElementById('shopMenu').style.display = 'none';
}

function buySkin(index) {
    const skin = SKINS[index];
    if (skin.price > gameState.coins) {
        alert('Not enough coins!');
        return;
    }

    gameState.coins -= skin.price;
    gameState.selectedSkin = skin.name;
    alert(`Purchased ${skin.name}!`);
    openShop(); // Refresh
}

// Start the game
window.addEventListener('load', () => {
    initGame();
});
