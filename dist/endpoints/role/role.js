"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateRoleEndpoint = exports.updatePermissionEndpoint = exports.getRoleEndpoint = exports.getRoleDetailsEndpoint = exports.getPermissionEndpoint = exports.deleteRoleEndpoint = exports.deletePermissionEndpoint = exports.createRoleEndpoint = exports.createPermissionEndpoint = void 0;
var _nodeServerEngine = require("node-server-engine");
var _role = require("./role.handler");
var _role2 = require("./role.const");
var _role3 = require("./role.validator");
var _middleware = require("../../middleware");
// Create Role Endpoint
const createRoleEndpoint = exports.createRoleEndpoint = new _nodeServerEngine.Endpoint({
  path: '/roles',
  method: _nodeServerEngine.EndpointMethod.POST,
  handler: async (req, res) => {
    try {
      const role = await (0, _role.createRoleTable)(req, req.body);
      res.status(201).json({
        message: 'Role created successfully',
        role
      });
    } catch (error) {
      res.status(500).json({
        message: _role2.ROLE_CREATION_ERROR,
        error
      });
    }
  },
  authType: _nodeServerEngine.EndpointAuthType.JWT,
  validator: _role3.createRoleValidator,
  middleware: [(0, _middleware.checkPermission)('CreateRole')]
});

// Get All Permission Endpoint
const getRoleEndpoint = exports.getRoleEndpoint = new _nodeServerEngine.Endpoint({
  path: '/roles',
  method: _nodeServerEngine.EndpointMethod.GET,
  handler: async (req, res) => {
    try {
      const role = await (0, _role.getAllRolesHandler)();
      if (!role) {
        res.status(404).json({
          message: _role2.ROLE_NOT_FOUND
        });
        return;
      }
      res.status(200).json({
        message: 'Role retrieved successfully',
        role
      });
    } catch (error) {
      res.status(500).json({
        message: _role2.ROLE_GET_ERROR,
        error
      });
    }
  },
  authType: _nodeServerEngine.EndpointAuthType.JWT,
  validator: {},
  middleware: [(0, _middleware.checkPermission)('GetRole')]
});

//getroleDetails
const getRoleDetailsEndpoint = exports.getRoleDetailsEndpoint = new _nodeServerEngine.Endpoint({
  path: '/roles/:roleId',
  method: _nodeServerEngine.EndpointMethod.GET,
  handler: async (req, res) => {
    const {
      roleId
    } = req.params;
    try {
      const role = await (0, _role.getRoleDetailsHandler)(roleId);
      res.status(200).json({
        message: 'Role retrieved successfully',
        role
      });
    } catch (error) {
      res.status(404).json({
        message: _role2.ROLE_NOT_FOUND,
        error
      });
    }
  },
  authType: _nodeServerEngine.EndpointAuthType.JWT,
  validator: {},
  middleware: [(0, _middleware.checkPermission)('GetRole')]
});

// update Role endpoint
const updateRoleEndpoint = exports.updateRoleEndpoint = new _nodeServerEngine.Endpoint({
  path: '/roles/:id',
  method: _nodeServerEngine.EndpointMethod.PUT,
  handler: async (req, res) => {
    try {
      const updateRole = await (0, _role.updateRolesHandler)(req, req.params.id, req.body);
      res.status(200).json({
        message: 'Role updated successfully',
        updateRole
      });
    } catch (error) {
      res.status(500).json({
        message: _role2.ROLE_UPDATE_ERROR,
        error
      });
    }
  },
  authType: _nodeServerEngine.EndpointAuthType.JWT,
  validator: _role3.updateRoleValidator,
  middleware: [(0, _middleware.checkPermission)('UpdateRole')]
});

// delete Role endpoint
const deleteRoleEndpoint = exports.deleteRoleEndpoint = new _nodeServerEngine.Endpoint({
  path: '/roles/:id',
  method: _nodeServerEngine.EndpointMethod.DELETE,
  handler: async (req, res) => {
    try {
      await (0, _role.deleteRoleHandler)(req, req.params.id);
      res.status(200).json({
        message: 'Role deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        message: _role2.ROLE_DELETE_ERROR,
        error
      });
    }
  },
  authType: _nodeServerEngine.EndpointAuthType.JWT,
  validator: _role3.deleteRoleValidator,
  middleware: [(0, _middleware.checkPermission)('DeleteRole')]
});

// Create Permission Endpoint
const createPermissionEndpoint = exports.createPermissionEndpoint = new _nodeServerEngine.Endpoint({
  path: '/permissions',
  method: _nodeServerEngine.EndpointMethod.POST,
  handler: async (req, res) => {
    try {
      const permission = await (0, _role.createPermissionHandler)(req, req.body);
      res.status(201).json({
        message: 'Permission created successfully',
        permission
      });
    } catch (error) {
      res.status(500).json({
        message: _role2.PERMISSION_CREATION_ERROR,
        error
      });
    }
  },
  authType: _nodeServerEngine.EndpointAuthType.JWT,
  validator: _role3.createPermissionValidator,
  middleware: [(0, _middleware.checkPermission)('CreatePermission')]
});

// Get All Permission Endpoint
const getPermissionEndpoint = exports.getPermissionEndpoint = new _nodeServerEngine.Endpoint({
  path: '/permissions',
  method: _nodeServerEngine.EndpointMethod.GET,
  handler: async (req, res) => {
    try {
      const permission = await (0, _role.getAllPermissionHandler)();
      if (!permission) {
        res.status(404).json({
          message: _role2.PERMISSION_NOT_FOUND
        });
        return;
      }
      res.status(200).json({
        message: 'Permission retrieved successfully',
        permission
      });
    } catch (error) {
      res.status(500).json({
        message: _role2.PERMISSION_GET_ERROR,
        error
      });
    }
  },
  authType: _nodeServerEngine.EndpointAuthType.JWT,
  validator: {},
  middleware: [(0, _middleware.checkPermission)('GetPermission')]
});

// update Permission endpoint
const updatePermissionEndpoint = exports.updatePermissionEndpoint = new _nodeServerEngine.Endpoint({
  path: '/permissions/:action',
  method: _nodeServerEngine.EndpointMethod.PUT,
  handler: async (req, res) => {
    try {
      const updatePermission = await (0, _role.updatePermissionHandler)(req, req.params.action, req.body);
      res.status(200).json({
        message: 'Permission updated successfully',
        updatePermission
      });
    } catch (error) {
      res.status(500).json({
        message: _role2.PERMISSION_UPDATE_ERROR,
        error
      });
    }
  },
  authType: _nodeServerEngine.EndpointAuthType.JWT,
  validator: _role3.updatePermissionValidator,
  middleware: [(0, _middleware.checkPermission)('UpdatePermission')]
});

// delete Permission endpoint
const deletePermissionEndpoint = exports.deletePermissionEndpoint = new _nodeServerEngine.Endpoint({
  path: '/permissions/:action',
  method: _nodeServerEngine.EndpointMethod.DELETE,
  handler: async (req, res) => {
    try {
      await (0, _role.deletePermissionHandler)(req, req.params.action);
      res.status(200).json({
        message: 'Permission deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        message: _role2.PERMISSION_DELETE_ERROR,
        error
      });
    }
  },
  authType: _nodeServerEngine.EndpointAuthType.JWT,
  validator: _role3.deletePermissionValidator,
  middleware: [(0, _middleware.checkPermission)('DeletePermission')]
});
//# sourceMappingURL=role.js.map