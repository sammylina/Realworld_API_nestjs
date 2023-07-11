import { Test, TestingModule } from "@nestjs/testing";
import { UserModule } from "../user/user.module";

import { ArticleController } from "./article.controller";
import { ArticleService } from "./article.service";


describe('Article controller', () => {
    let service: ArticleService;
    let controller: ArticleController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [UserModule],
            controllers: [ArticleController],
            providers: [ArticleService]
        }).compile()
        service = module.get(ArticleService)
        controller = module.get(ArticleController) 

    })

    describe('service and controllers should be defined', () => {
        expect([service, controller]).toBeDefined();
    });

})