// src/controllers/product.controller.js
// Controlador de productos — maneja HTTP y delega a ProductService

const productService = require('../services/product.service');
const { sendSuccess, sendPaginated } = require('../utils/response');

const list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, categoryId, search } = req.query;
    const result = await productService.listProducts({
      page: parseInt(page), limit: parseInt(limit), status, categoryId, search,
    });
    return sendPaginated(res, result.data, result.meta);
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(parseInt(req.params.id));
    return sendSuccess(res, product);
  } catch (err) { next(err); }
};

const searchByBarcode = async (req, res, next) => {
  try {
    const product = await productService.searchByBarcode(req.params.code);
    return sendSuccess(res, product);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const ip = req.ip;
    const product = await productService.createProduct(req.body, req.user.id, ip);
    return sendSuccess(res, product, 201, 'Producto creado');
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(parseInt(req.params.id), req.body, req.user.id, req.ip);
    return sendSuccess(res, product);
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await productService.deleteProduct(parseInt(req.params.id), req.user.id, req.ip);
    return sendSuccess(res, null, 200, 'Producto desactivado');
  } catch (err) { next(err); }
};

const createVariant = async (req, res, next) => {
  try {
    const variant = await productService.createVariant(parseInt(req.params.id), req.body, req.user.id, req.ip);
    return sendSuccess(res, variant, 201, 'Variante creada');
  } catch (err) { next(err); }
};

const listCategories = async (req, res, next) => {
  try {
    const categories = await productService.listCategories();
    return sendSuccess(res, categories);
  } catch (err) { next(err); }
};

const listSizes = async (req, res, next) => {
  try {
    const sizes = await productService.listSizes();
    return sendSuccess(res, sizes);
  } catch (err) { next(err); }
};

const listColors = async (req, res, next) => {
  try {
    const colors = await productService.listColors();
    return sendSuccess(res, colors);
  } catch (err) { next(err); }
};

module.exports = { list, getById, searchByBarcode, create, update, remove, createVariant, listCategories, listSizes, listColors };
