import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { UtilsService } from "src/utils/utils.service";
import { Repository } from "typeorm";
import { Tag } from "../domain/tag";
import { TagFactory } from "../domain/tag.factory";
import { TagEntity } from "../infra/db/entity/tag.entity";
import { TagRepository } from "../infra/db/repository/tag.repository";
import { TagUseCases } from "./tag.use-case"


describe('tag-use-case',() => {
    let service: TagUseCases;
    let tagRepository: TagRepository;
    let utilsService: UtilsService;
    let tagEntityRepository: Repository<TagEntity>
    const mockUtilService = () => {
        // UtilsService
    }
    const MockTagRepository = {
        attachTag: jest.fn()
    }
    beforeEach(async ()=>{ 
        const module = await Test.createTestingModule({
            providers: [
                TagUseCases,
                { 
                    provide: 'TagRepository', 
                    useValue: {
                        getAll:jest.fn().mockResolvedValue([]),
                        find:jest.fn().mockResolvedValue([])
                    } 
                },
                TagFactory,
                UtilsService,
                { 
                    provide: 'TagEntityRepository', 
                    useValue: {
                        save:jest.fn()
                    } 
                },
            ]
        }).compile()
        service = module.get(TagUseCases);
        tagRepository = module.get('TagRepository');
        tagEntityRepository = module.get('TagEntityRepository');
    })

    it('be defined service', () => {
        expect(service).toBeDefined()
    })

    it('be defined repository', () => {
        expect(tagRepository).toBeDefined()
        
    })

    it('방어적 코드: 해당하는 태그가 없을 경우 빈 배열을 반환 한다.',async ()=>{
        // jest.spyOn(tagRepository, 'getAll').mockRejectedValue(null)
        expect(await service.getAllTags()).toStrictEqual([])
    })
})