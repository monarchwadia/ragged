import { RaggedTool } from 'ragged';
import type { SpaceshipSection } from '../../types';

export const repairSectionTool = new RaggedTool()
	.title('repairSection')
	.description('Repair a section of a spaceship')
	.example({
		description: 'Repairing a section of a spaceship restores its hull strength to 100.',
		input: {
			id: 1,
			name: 'Some Section',
			hullStrength: 0
		} as SpaceshipSection,
		output: {
			id: 1,
			name: 'Some Section',
			hullStrength: 100
		} as SpaceshipSection
	})
	.example({
		description:
			'Repairing a section of a spaceship that is already at full hull strength does nothing.',
		input: {
			id: 1,
			name: 'Commanding Station',
			hullStrength: 100
		} as SpaceshipSection,
		output: {
			id: 1,
			name: 'Commanding Station',
			hullStrength: 100
		} as SpaceshipSection
	})
	.handler((section: SpaceshipSection): SpaceshipSection => {
		if (section.hullStrength < 100) {
			section.hullStrength = 100;
		}
		return section;
	});
