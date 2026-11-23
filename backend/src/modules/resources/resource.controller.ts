import type { Request, Response, NextFunction } from "express";
import { availabilityQuerySchema, createResourceSchema, resourceQuerySchema, updateResourceSchema } from "./resource.validation";
import { createResource, getResourceAvailability, getResourceById, getResources, updateResource } from "./resource.service";

export async function getResourcesController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const query = resourceQuerySchema.parse(req.query);
    const result = await getResources(query, req.user!.role);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
export async function getResourceByIdController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const resource = await getResourceById(
      req.params.id as string,
      req.user!.role
    );

    if (!resource) {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: "Resource not found",
        },
      });
    }

    return res.status(200).json(resource);
  } catch (error) {
    next(error);
  }
}
export async function createResourceController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const input = createResourceSchema.parse(req.body);
    const resource = await createResource(input);

    return res.status(201).json(resource);
  } catch (error) {
    next(error);
  }
}

export async function updateResourceController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const input = updateResourceSchema.parse(req.body);

    const resource = await updateResource(
      req.params.id as string,
      input
    );

    if (!resource) {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: "Resource not found",
        },
      });
    }

    return res.status(200).json(resource);
  } catch (error) {
    next(error);
  }
}

export async function getResourceAvailabilityController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const query = availabilityQuerySchema.parse(req.query);

    const result = await getResourceAvailability(
      req.params.id as string,
      req.user!.role,
      new Date(query.from),
      new Date(query.to)
    );

    if (!result) {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: "Resource not found",
        },
      });
    }

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}