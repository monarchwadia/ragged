// types

export type SpaceShip = {
	name: string;
	sections: SpaceshipSection[];
	shieldStrength: number;
};
export type SpaceshipSection = {
	id: number;
	name: string;
	hullStrength: number;
};

export type LoggedInUser = 'Captain' | 'Crew';
