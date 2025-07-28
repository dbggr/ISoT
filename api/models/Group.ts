/**
 * Group model interface and types
 * Represents logical organization units for network services
 */

export interface Group {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateGroupDto {
  name: string;
  description?: string;
}

export interface UpdateGroupDto {
  name?: string;
  description?: string;
}

export interface GroupWithServices extends Group {
  services?: import('./NetworkService').NetworkService[];
}