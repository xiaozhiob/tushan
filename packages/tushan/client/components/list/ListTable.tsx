import React, { useMemo, useState } from 'react';
import {
  Button,
  Card,
  Divider,
  Space,
  Table,
  Tooltip,
} from '@arco-design/web-react';
import { useResourceContext } from '../../context/resource';
import { SortPayload, useGetList } from '../../api';
import { IconEdit, IconEye } from '@arco-design/web-react/icon';
import type { FieldHandler } from '../field';
import { useListTableDrawer } from './ListTableDrawer';
import { ListDeleteAction } from './actions/DeleteAction';
import styled from 'styled-components';
import { useObjectState } from '../../hooks/useObjectState';
import { useDebounce } from '../../hooks/useDebounce';
import { ListFilter } from './ListFilter';

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
`;

export interface ListTableProps {
  filter?: FieldHandler[];
  fields: FieldHandler[];
  action?: {
    create?: boolean;
    detail?: boolean;
    edit?: boolean;
    delete?: boolean;
  };
}
export const ListTable: React.FC<ListTableProps> = React.memo((props) => {
  const resource = useResourceContext();
  const [filterValues, setFilterValues] = useObjectState({});
  const [sort, setSort] = useState<SortPayload | undefined>(undefined);
  const lazyFilter = useDebounce(filterValues, { wait: 500 });
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const { data, isLoading, total } = useGetList(resource, {
    pagination: {
      pageNum,
      pageSize,
    },
    filter: lazyFilter,
    sort,
  });
  const action = props.action;
  const { showTableDrawer, drawerEl } = useListTableDrawer(props.fields);

  const columns = useMemo(() => {
    const c = [...props.fields].map((fieldHandler) => fieldHandler('list'));

    if (action) {
      c.push({
        key: 'actions',
        title: 'Actions',
        fixed: 'right',
        render: (val, record) => {
          return (
            <Space>
              {action.detail && (
                <Tooltip content="Detail">
                  <Button
                    icon={<IconEye />}
                    onClick={() => showTableDrawer('detail', record)}
                  />
                </Tooltip>
              )}

              {action.edit && (
                <Tooltip content="Edit">
                  <Button
                    icon={<IconEdit />}
                    onClick={() => showTableDrawer('edit', record)}
                  />
                </Tooltip>
              )}

              {action.delete && <ListDeleteAction record={record} />}
            </Space>
          );
        },
      });
    }

    return c;
  }, [props.fields, action]);

  return (
    <Card>
      <Header>
        <div>
          <ListFilter
            fields={props.filter ?? []}
            filterValues={filterValues}
            onChangeFilter={(values) => setFilterValues(values)}
          />
        </div>
        <div>
          {action?.create && (
            <Button
              type="primary"
              onClick={() => {
                showTableDrawer('edit', null);
              }}
            >
              Create
            </Button>
          )}
        </div>
      </Header>

      <Divider />

      <Table
        loading={isLoading}
        columns={columns}
        data={data}
        rowKey="id"
        pagination={{
          total,
          current: pageNum,
          pageSize,
          onChange: (pageNum, pageSize) => {
            setPageNum(pageNum);
            setPageSize(pageSize);
          },
        }}
        onChange={(pagination, sorter) => {
          const { field, direction } = sorter;

          if (field && direction) {
            setSort({
              field,
              order: direction === 'ascend' ? 'ASC' : 'DESC',
            });
          } else {
            setSort(undefined);
          }
        }}
      />

      {drawerEl}
    </Card>
  );
});
ListTable.displayName = 'ListTable';