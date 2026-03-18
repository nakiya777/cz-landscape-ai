
import { CanvasItem, Season, TimeOfDay, ViewType, BuildingMainCategory, BuildingFloors, PlantData } from '../types';
import { BUILDING_TASTES } from '../constants';

export const generateAutoPrompt = (
    viewType: ViewType,
    season: Season,
    time: TimeOfDay,
    buildingCategory: BuildingMainCategory,
    buildingStyle: string,
    buildingFloors: BuildingFloors,
    items: CanvasItem[],
    pixelsPerMeter: number
): string => {
    let promptParts = [
        `A photorealistic architectural visualization render.`,
        `The output must strictly match the spatial structure and layout of the provided reference image.`,
        `Context: ${viewType} perspective, ${season} season, ${time} lighting environment.`
    ];

    if (buildingCategory !== 'none') {
        const styleObj = BUILDING_TASTES[buildingCategory].styles.find(s => s.id === buildingStyle);
        if (styleObj) {
            const floorLabel = buildingFloors === '1' ? 'one-story bungalow' : `${buildingFloors}-story residential structure`;
            promptParts.push(`Central Building: A ${floorLabel} in ${styleObj.prompt}. It must occupy the area marked on the plan.`);
        }
    }

    const itemsDesc = items.map(item => {
        const wM = (item.width / pixelsPerMeter).toFixed(1);
        const hM = (item.height / pixelsPerMeter).toFixed(1);
        const rot = Math.round(item.rotation);

        let description = item.data.en;
        let sizePrefix = "";

        if (item.type === 'plant') {
            const actualWidth = item.width / pixelsPerMeter;
            if (actualWidth > 2.5) {
                sizePrefix = "A magnificent large mature ";
                description = description.replace('tree', 'stately tree').replace('shrub', 'large dense shrub');
            } else if (actualWidth > 1.5) {
                sizePrefix = "A well-established medium-sized ";
            } else {
                sizePrefix = "A young ";
            }
        } else {
            sizePrefix = "A precisely placed ";
        }

        const rotationInfo = rot !== 0 ? `, rotated exactly ${rot} degrees` : "";
        return `${sizePrefix}${description} (scale: ${wM}m x ${hM}m${rotationInfo})`;
    }).join('. ');

    if (itemsDesc) {
        promptParts.push(`Landscape Elements Detail: ${itemsDesc}. Each element should be rendered exactly within its corresponding footprint in the reference plan.`);
    }

    return promptParts.join(' ');
};
