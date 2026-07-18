import { world, system, EntityComponentTypes, EquipmentSlot, EntityEquippableComponent, Player } from "@minecraft/server";

const mutekiCatalyst = `mutekiaddon:muteki_catalyst`;

const muteki_ticks = 100;

const findSlots = [EquipmentSlot.Mainhand, EquipmentSlot.Offhand, EquipmentSlot.Head];

const hadMuteki = /** @type { Map<String, { "remain": Number, "heal": Number }> } */ (new Map());

const mutekiAbilities = [
    {
        typeId: `minecraft:fire_resistance`,
        amplifier: 2
    },
    {
        typeId: `minecraft:strength`,
        amplifier: 2
    },
    {
        typeId: `minecraft:speed`,
        amplifier: 15
    },
    {
        typeId: `minecraft:jump_boost`,
        amplifier: 5
    },
    {
        typeId: `minecraft:night_vision`,
        amplifier: 0,
        duration: 300
    },
    {
        typeId: `minecraft:conduit_power`,
        amplifier: 4,
    },
    {
        typeId: `minecraft:saturation`,
        amplifier: 0,
    },
    {
        typeId: `minecraft:haste`,
        amplifier: 2,
    },
    {
        typeId: `minecraft:village_hero`,
        amplifier: 100,
    }
];

const events = [
    "blockContainerClosed",
    "blockContainerOpened",
    "blockExplode",
    "buttonPush",
    "entityContainerClosed",
    "entityContainerOpened",
    "entityDie",
    "entityHitBlock",
    "entityHitEntity",
    "entityHurt",
    "entityItemDrop",
    "entityItemPickup",
    "entityLoad",
    "entityRemove",
    "entitySpawn",
    "explosion",
    "gameRuleChange",
    "itemCompleteUse",
    "itemReleaseUse",
    "itemStartUse",
    "itemStartUseOn",
    "itemStopUse",
    "itemStopUseOn",
    "itemUse",
    "leverAction",
    "pistonActivate",
    "playerBreakBlock",
    "playerButtonInput",
    "playerDimensionChange",
    "playerEmote",
    "playerGameModeChange",
    "playerHotbarSelectedSlotChange",
    "playerInputModeChange",
    "playerInputPermissionCategoryChange",
    "playerInteractWithBlock",
    "playerInteractWithEntity",
    "playerInventoryItemChange",
    "playerJoin",
    "playerLeave",
    "playerPlaceBlock",
    "playerSpawn",
    "playerSwingStart",
    "pressurePlatePop",
    "pressurePlatePush",
    "projectileHitBlock",
    "projectileHitEntity",
    "targetBlockHit",
    "tripWireTrip",
    "weatherChange",
    "worldLoad"
];

/**
 * 
 * @param { EntityEquippableComponent } equippableComponent 
 * @returns { Boolean }
 */
function findMutekiCatalyst(equippableComponent) {
    return findSlots.some(slot => equippableComponent.getEquipment(slot)?.typeId === mutekiCatalyst);
};

function muteki() {

    const players = world.getAllPlayers();

    for (const player of players) {

        const mutekiMap = hadMuteki.get(player.id);
        if (!mutekiMap) continue;

        const healthComponent = player.getComponent(EntityComponentTypes.Health);
        if (!healthComponent) continue;

        system.runTimeout(() => {
            healthComponent.resetToMaxValue();
        }, 0.99);

    };

};

system.runInterval(() => {

    const players = world.getAllPlayers();

    for (const player of players) {

        const mutekiMap = hadMuteki.get(player.id);

        const equippableComponent = player.getComponent(EntityComponentTypes.Equippable);
        if (!equippableComponent) continue;

        const hasMutekiCatalyst = findMutekiCatalyst(equippableComponent);
        if (!mutekiMap) {
            if (hasMutekiCatalyst) {
                hadMuteki.set(player.id, { "remain": 100, "heal": 2 });
            };
        } else {
            if (hasMutekiCatalyst) {
                mutekiMap.remain = muteki_ticks;
            } else if (mutekiMap.remain > 0) {
                mutekiMap.remain -= 1;
            } else {
                if (hadMuteki.has(player.id)) hadMuteki.delete(player.id);
                continue;
            };
            if (!mutekiMap.heal) mutekiMap.heal = 2;
        };

        if (!mutekiMap || mutekiMap.remain < 0) continue;

        system.runTimeout(() => {
            const healthComponent = player.getComponent(EntityComponentTypes.Health);
            if (!healthComponent) return;
            healthComponent.resetToMaxValue();
        }, 0.99);

        mutekiAbilities.forEach(mutekiAbility => {
            player.addEffect(mutekiAbility.typeId, mutekiAbility.duration ? mutekiAbility.duration : 100, { amplifier: mutekiAbility.amplifier, showParticles: false });
        });

    };

});

world.beforeEvents.entityHurt.subscribe(ev => {

    const { hurtEntity } = ev;

    if (!(hurtEntity instanceof Player)) return;

    const mutekiMap = hadMuteki.get(hurtEntity.id);
    if (!mutekiMap) return;

    ev.cancel = true;

});

// world.afterEvents.entityHealthChanged.subscribe(ev => {

//     const { entity } = ev;

//     if (!(entity instanceof Player)) return;

//     const mutekiMap = hadMuteki.get(entity.id);
//     if (!mutekiMap) return;

//     system.runTimeout(() => {

//         const healthComponent = entity.getComponent(EntityComponentTypes.Health);
//         if (!healthComponent) return;

//         if (healthComponent.currentValue <= 0 || mutekiMap.heal > 0) {
//             healthComponent.resetToMaxValue();
//             mutekiMap.heal -= 1;
//         };

//     }, 0.99);

// });

world.beforeEvents.playerLeave.subscribe(ev => {

    const { player } = ev;
    if (hadMuteki.has(player.id)) {
        hadMuteki.delete(player.id);
    };

});

for (const event of events) {
    try {
        world.afterEvents[event].subscribe(() => {
            muteki();
        });
    } catch (e) {
        console.error(event);
    };
};

system.afterEvents.scriptEventReceive.subscribe(ev => {
    muteki();
});