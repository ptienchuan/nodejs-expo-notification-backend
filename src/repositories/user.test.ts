import faker from "faker";
import userRepo, { RegisterUserPatameter } from "@/repositories/user";
import UserModel, { User } from "@/models/user";

describe("User repository: ", () => {
  let userFixture: User;
  const rawPassword = faker.random.words(2);

  beforeEach(async () => {
    await UserModel.remove({});
    userFixture = await new UserModel({
      name: faker.random.word(),
      password: rawPassword,
    } as User).save();
  });

  test("register() - Should succeed", async () => {
    const userParameter: RegisterUserPatameter = {
      name: "  user_Name  ",
      password: faker.random.words(5),
      expoToken: faker.random.word(),
    };
    const createdUser = await userRepo.register(userParameter);

    const user = await UserModel.findById(createdUser._id);
    expect(user).toMatchObject({
      name: "user_name",
      expoToken: userParameter.expoToken,
    });
    expect(user.authTokens).toHaveLength(0);
    expect(user.password).not.toBe(userParameter.password);
  });

  test("findByCredentials() - Should return a user", async () => {
    const user = await userRepo.findByCredentials(
      userFixture.name,
      rawPassword
    );

    expect(user).toMatchObject({
      _id: userFixture._id,
      name: userFixture.name,
      expoToken: "",
    });
    expect(user.authTokens).toHaveLength(0);
  });

  test("findByCredentials() - Should return undefined", async () => {
    let user = await userRepo.findByCredentials(
      `${userFixture.name}-diff`,
      rawPassword
    );
    expect(user).toBeUndefined();

    user = await userRepo.findByCredentials(
      userFixture.name,
      userFixture.password
    );
    expect(user).toBeUndefined();

    user = await userRepo.findByCredentials(
      `${userFixture.name}-diff`,
      userFixture.password
    );
    expect(user).toBeUndefined();
  });
});
