import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { Tag } from "src/core/entities";
import { BaseResponseDto } from "../common/base-response.dto";

export class CreateTagDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'URL '})
  tag: string;
};

export class CreateTagResponseDto extends BaseResponseDto {
  createdTag: Tag;
};
