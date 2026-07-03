import { world, system, EntityComponentTypes, EquipmentSlot, EntityEquippableComponent, Player } from "@minecraft/server";

const mutekiCatalyst = `mutekiaddon:muteki_catalyst`;

const findSlots = [EquipmentSlot.Mainhand, EquipmentSlot.Offhand, EquipmentSlot.Head];

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
        duration: 205
    },
    {
        typeId: `minecraft:water_breathing`,
        amplifier: 0,
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
    "dataDrivenEntityTrigger",
    "effectAdd",
    "entityContainerClosed",
    "entityContainerOpened",
    "entityDie",
    "entityHeal",
    "entityHealthChanged",
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

        const equippableComponent = player.getComponent(EntityComponentTypes.Equippable);
        if (!equippableComponent) return;

        const hasMutekiCatalyst = findMutekiCatalyst(equippableComponent);
        if (!hasMutekiCatalyst) return;

        const healthComponent = player.getComponent(EntityComponentTypes.Health);
        if (!healthComponent) return;

        system.runTimeout(() => {
            healthComponent.resetToMaxValue();
        }, 0.99);

    };

};

system.runInterval(() => {

    const players = world.getAllPlayers();

    for (const player of players) {

        const equippableComponent = player.getComponent(EntityComponentTypes.Equippable);
        if (!equippableComponent) return;

        const hasMutekiCatalyst = findMutekiCatalyst(equippableComponent);
        if (!hasMutekiCatalyst) return;

        system.runTimeout(() => {
            const healthComponent = player.getComponent(EntityComponentTypes.Health);
            if (!healthComponent) return;
            healthComponent.resetToMaxValue();
        }, 0.99);

        mutekiAbilities.forEach(mutekiAbility => {
            player.addEffect(mutekiAbility.typeId, mutekiAbility.duration ? mutekiAbility.duration : 5, { amplifier: mutekiAbility.amplifier, showParticles: false });
        });

    };

});

world.beforeEvents.entityHurt.subscribe(ev => {

    const { hurtEntity } = ev;

    if (!(hurtEntity instanceof Player)) return;

    const equippableComponent = hurtEntity.getComponent(EntityComponentTypes.Equippable);
    if (!equippableComponent) return;

    const hasMutekiCatalyst = findMutekiCatalyst(equippableComponent);
    if (!hasMutekiCatalyst) return;

    ev.cancel = true;

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