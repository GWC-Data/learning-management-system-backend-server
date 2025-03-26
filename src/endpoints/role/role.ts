import { Endpoint, EndpointAuthType, EndpointMethod } from 'node-server-engine';
import {
  createPermissionHandler,
  getAllPermissionHandler,
  updatePermissionHandler,
  deletePermissionHandler,
  createRoleTable,
  getRoleDetailsHandler,
  getAllRolesHandler,
  updateRolesHandler,
  deleteRoleHandler
} from './role.handler';
import {
  PERMISSION_CREATION_ERROR,
  PERMISSION_NOT_FOUND,
  PERMISSION_UPDATE_ERROR,
  PERMISSION_DELETE_ERROR,
  PERMISSION_GET_ERROR,
  ROLE_CREATION_ERROR,
  ROLE_GET_ERROR,
  ROLE_NOT_FOUND,
  ROLE_UPDATE_ERROR,
  ROLE_DELETE_ERROR
} from './role.const';
import {
  createPermissionValidator,
  updatePermissionValidator,
  deletePermissionValidator,
  createRoleValidator,
  updateRoleValidator,
  deleteRoleValidator
} from './role.validator';
import { checkPermission } from 'middleware';

// Create Role Endpoint
export const createRoleEndpoint = new Endpoint({
  path: '/roles',
  method: EndpointMethod.POST,
  handler: async (req, res): Promise<void> => {
    try {
      const role = await createRoleTable(req, req.body);

      res.status(201).json({ message: 'Role created successfully', role });
    } catch (error) {
      res.status(500).json({ message: ROLE_CREATION_ERROR, error });
    }
  },
  authType: EndpointAuthType.JWT,
  validator: createRoleValidator,
  middleware: [checkPermission('CreateRole')]
});

// Get All Permission Endpoint
export const getRoleEndpoint = new Endpoint({
  path: '/roles',
  method: EndpointMethod.GET,
  handler: async (req, res): Promise<void> => {
    try {
      const role = await getAllRolesHandler();

      if (!role) {
        res.status(404).json({ message: ROLE_NOT_FOUND });
        return;
      }

      res.status(200).json({ message: 'Role retrieved successfully', role });
    } catch (error) {
      res.status(500).json({ message: ROLE_GET_ERROR, error });
    }
  },
  authType: EndpointAuthType.JWT,
  validator: {},
  middleware: [checkPermission('GetRole')]
});

//getroleDetails
export const getRoleDetailsEndpoint = new Endpoint({
  path: '/roles/:roleId',
  method: EndpointMethod.GET,
  handler: async (req, res): Promise<void> => {
    const { roleId } = req.params;

    try {
      const role = await getRoleDetailsHandler(roleId);

      res.status(200).json({ message: 'Role retrieved successfully', role });
    } catch (error) {
      res.status(404).json({ message: ROLE_NOT_FOUND, error });
    }
  },
  authType: EndpointAuthType.JWT,
  validator: {},
  middleware: [checkPermission('GetRole')]
});


// update Role endpoint
export const updateRoleEndpoint = new Endpoint({
  path: '/roles/:id',
  method: EndpointMethod.PUT,
  handler: async (req, res): Promise<void> => {
    try {
      const updateRole = await updateRolesHandler(req, req.params.id, req.body);
      res.status(200).json({ message: 'Role updated successfully', updateRole });
    } catch (error) {
      res.status(500).json({ message: ROLE_UPDATE_ERROR, error });
    }
  },
  authType: EndpointAuthType.JWT,
  validator: updateRoleValidator,
  middleware: [checkPermission('UpdateRole')]
});

// delete Role endpoint
export const deleteRoleEndpoint = new Endpoint({
  path: '/roles/:id',
  method: EndpointMethod.DELETE,
  handler: async (req, res): Promise<void> => {
    try {
      await deleteRoleHandler(req, req.params.id);
      res.status(200).json({ message: 'Role deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: ROLE_DELETE_ERROR, error });
    }
  },
  authType: EndpointAuthType.JWT,
  validator: deleteRoleValidator,
  middleware: [checkPermission('DeleteRole')]
});


// Create Permission Endpoint
export const createPermissionEndpoint = new Endpoint({
  path: '/permissions',
  method: EndpointMethod.POST,
  handler: async (req, res): Promise<void> => {
    try {
      const permission = await createPermissionHandler(req, req.body);

      res.status(201).json({ message: 'Permission created successfully', permission });
    } catch (error) {
      res.status(500).json({ message: PERMISSION_CREATION_ERROR, error });
    }
  },
  authType: EndpointAuthType.JWT,
  validator: createPermissionValidator,
  middleware: [checkPermission('CreatePermission')]
});


// Get All Permission Endpoint
export const getPermissionEndpoint = new Endpoint({
  path: '/permissions',
  method: EndpointMethod.GET,
  handler: async (req, res): Promise<void> => {
    try {
      const permission = await getAllPermissionHandler();

      if (!permission) {
        res.status(404).json({ message: PERMISSION_NOT_FOUND });
        return;
      }

      res.status(200).json({ message: 'Permission retrieved successfully', permission });
    } catch (error) {
      res.status(500).json({ message: PERMISSION_GET_ERROR, error });
    }
  },
  authType: EndpointAuthType.JWT,
  validator: {},
  middleware: [checkPermission('GetPermission')]
});

// update Permission endpoint
export const updatePermissionEndpoint = new Endpoint({
  path: '/permissions/:action',
  method: EndpointMethod.PUT,
  handler: async (req, res): Promise<void> => {
    try {
      const updatePermission = await updatePermissionHandler(req, req.params.action, req.body);
      res.status(200).json({ message: 'Permission updated successfully', updatePermission });
    } catch (error) {
      res.status(500).json({ message: PERMISSION_UPDATE_ERROR, error });
    }
  },
  authType: EndpointAuthType.JWT,
  validator: updatePermissionValidator,
  middleware: [checkPermission('UpdatePermission')]
});

// delete Permission endpoint
export const deletePermissionEndpoint = new Endpoint({
  path: '/permissions/:action',
  method: EndpointMethod.DELETE,
  handler: async (req, res): Promise<void> => {
    try {
      await deletePermissionHandler(req, req.params.action);
      res.status(200).json({ message: 'Permission deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: PERMISSION_DELETE_ERROR, error });
    }
  },
  authType: EndpointAuthType.JWT,
  validator: deletePermissionValidator,
  middleware: [checkPermission('DeletePermission')]
});
