import { successResponse, errorResponse } from "@/lib/api-response";
import { UserService } from "@/services/user.service";

export async function GET() {
  try {
    const users = await UserService.getAllUsers();
    return successResponse(users);
  } catch (error: any) {
    return errorResponse(error.message);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newUser = await UserService.createUser(body);
    return successResponse(newUser, 'User created successfully', 201);
  } catch (error: any) {
    return errorResponse(error.message);
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, ...data } = await req.json();
    const updatedUser = await UserService.updateUser(id, data);
    return successResponse(updatedUser, 'User updated successfully');
  } catch (error: any) {
    return errorResponse(error.message);
  }
}
