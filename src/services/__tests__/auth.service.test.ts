import { beforeEach, describe, expect, it, vi } from "vitest";
import * as requestModule from "../../utils/request.utils";
import AuthService from "../auth.service";

describe("authService", () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
  });

  it("login calls request", async () => {
    const spy = vi
      .spyOn(requestModule, "request")
      .mockResolvedValue({ accessToken: "z", refreshToken: "x" });

    const res = await authService.login("a", "b");

    expect(spy).toHaveBeenCalled();
    expect(res.accessToken).toBe("z");
  });

  it("signup calls request", async () => {
    const spy = vi
      .spyOn(requestModule, "request")
      .mockResolvedValue({ accessToken: "t", refreshToken: "w" });

    await authService.signup("me@mail.com", "abc2346789", "John Doe", "learner");

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith({
      data: {
        email: "me@mail.com",
        password: "abc2346789",
        name: "John Doe",
        role: "learner",
      },
      method: "POST",
      url: "auth/signup",
    }, undefined);
  });
});
